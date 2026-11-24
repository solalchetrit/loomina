import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { formatToE164 } from '@/lib/phone';
import { db, findProfileByPhone } from '@/lib/loomina/db';
import { stripe } from '@/lib/stripe';
import { normalizeCallMinutes } from '@/lib/loomina/call-length';
import { notifyNewOrder, notifyFamilyInvite, alertTeam } from '@/lib/loomina/notify';
import { relanceAbandonedCarts } from '@/lib/loomina/abandoned-cart';
import { decodeFamilyFromStripe, storeFamilyMembers } from '@/lib/loomina/giver';
import { DEFAULT_WRITING_STYLE } from '@/lib/loomina/styles';
import { normalizeExtraCopies, extraCopiesLabel, EXTRA_COPY } from '@/config/offer';
import { extraCopiesOrders, type ExtraCopiesOrder } from '@/lib/loomina/extra-copies';

/**
 * Provisionnement d'un client après paiement.
 *
 * Trois règles qui n'étaient pas tenues avant :
 *
 *  1. On écrit le schéma v2 — `phase` (entier), pas `current_phase` (texte).
 *     Les colonnes legacy n'existent plus : les écrire faisait échouer l'insert.
 *
 *  2. On est idempotent. Stripe rejoue `checkout.session.completed` en cas de
 *     doute. `projects.stripe_session_id` est UNIQUE : un rejeu est détecté et
 *     ignoré au lieu de créer un second projet — ce qui cassait ensuite les
 *     `.maybeSingle()` du reste du code.
 *
 *  3. On répond 500 quand le provisionnement échoue. Avant, toute erreur
 *     renvoyait `{received:true}` : Stripe croyait à un succès et le client
 *     repartait sans compte, en silence. Un 500 déclenche le rejeu de Stripe.
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request: NextRequest) {
    const payload = await request.text();
    const sig = request.headers.get('stripe-signature');

    let event: Stripe.Event;
    try {
        if (!sig || !endpointSecret) {
            console.error('[stripe] signature ou secret absent');
            return NextResponse.json({ error: 'configuration' }, { status: 400 });
        }
        event = stripe().webhooks.constructEvent(payload, sig, endpointSecret);
    } catch (err) {
        console.error('[stripe] signature invalide', err);
        return NextResponse.json({ error: 'signature' }, { status: 400 });
    }

    // Panier abandonné : la page de paiement a expiré sans paiement.
    if (event.type === 'checkout.session.expired') {
        try {
            await handleAbandonedCart(event.data.object as Stripe.Checkout.Session);
        } catch (err) {
            // Une relance manquée ne mérite pas un rejeu de Stripe.
            console.error('[stripe] relance de panier impossible :', err instanceof Error ? err.message : String(err));
        }
        return NextResponse.json({ received: true });
    }

    if (event.type !== 'checkout.session.completed') {
        return NextResponse.json({ received: true });
    }

    const session = event.data.object as Stripe.Checkout.Session;
    const meta = session.metadata ?? {};

    // Exemplaires en plus commandés depuis l'espace auteur ou famille : rien à créer,
    // on les ajoute au livre (lib/loomina/extra-copies.ts).
    if (meta.kind === 'extra_copies') {
        try {
            await recordFamilyCopies(session);
            return NextResponse.json({ received: true });
        } catch (err) {
            console.error(`[stripe] exemplaires non notés (${session.id}) :`, err instanceof Error ? err.message : String(err));
            return NextResponse.json({ error: 'extra_copies_failed' }, { status: 500 });
        }
    }

    const email = meta.email?.trim();

    // Sans metadata, c'est le Payment Link concurrent : on ne peut rien créer.
    // On l'accepte (pas de rejeu utile) mais on le journalise bruyamment.
    if (!email) {
        console.error(
            `[stripe] session ${session.id} sans metadata.email — ` +
            'probablement le Payment Link. Aucun compte créé.'
        );
        return NextResponse.json({ received: true, provisioned: false });
    }

    const firstName = meta.firstName?.trim() || '';
    const lastName = meta.lastName?.trim() || '';
    const isGift = meta.isGift === 'true' || meta.isGift === '1';
    const phone = meta.phone ? formatToE164(meta.phone) : null;
    // Livre offert : celui qui offre ouvrira l'espace famille avec son propre numéro.
    const giverPhone = isGift && meta.giverPhone ? formatToE164(meta.giverPhone) : null;
    const giver =
        giverPhone && /^\+\d{8,15}$/.test(giverPhone) && giverPhone !== phone
            ? { first_name: meta.giverFirstName?.trim() || null, phone: giverPhone }
            : null;
    // Les autres proches ajoutés à la commande (lib/loomina/giver.ts).
    const family = giver ? decodeFamilyFromStripe(meta.family, [phone, giver.phone], new Date().toISOString()) : [];
    // Exemplaires en plus pris avec le livre (config/offer.ts).
    const extraCopies = normalizeExtraCopies(meta.extraCopies);
    const extraOrder: ExtraCopiesOrder | null = extraCopies
        ? { copies: extraCopies, unit_price: EXTRA_COPY.price, source: 'commande', stripe_session_id: session.id, at: new Date().toISOString() }
        : null;

    try {
        const supabase = db();

        // ── Idempotence : ce paiement a-t-il déjà été provisionné ? ──────────
        const { data: deja, error: dejaErr } = await supabase
            .from('projects')
            .select('id')
            .eq('stripe_session_id', session.id)
            .maybeSingle();

        if (dejaErr) throw new Error(`lecture projects : ${dejaErr.message}`);
        if (deja) {
            console.log(`[stripe] session ${session.id} déjà traitée — rejeu ignoré`);
            return NextResponse.json({ received: true, duplicate: true });
        }

        // ── Le compte d'authentification ─────────────────────────────────────
        // Le narrateur est identifié par son TÉLÉPHONE (c'est ainsi qu'il se
        // connecte et qu'il est reconnu quand il appelle), pas par l'e-mail
        // de l'acheteur. Avant : deux livres offerts avec le même e-mail
        // écrasaient le premier destinataire, qui perdait son accès.
        const resolved = await resolveNarratorAccount({ email, phone, firstName, lastName });
        const userId = resolved.userId;
        // Le compte d'authentification peut porter un alias « +numéro » (deux
        // narrateurs avec le même e-mail d'acheteur). La fiche, elle, garde
        // l'adresse tapée par le client : c'est là que partent ses e-mails
        // (Solal, 24/11/2026 : la fiche de Patricia affichait l'alias).
        const accountEmail = email || resolved.email;

        // ── Le profil ────────────────────────────────────────────────────────
        // Identité : écrasée par la commande (le client vient de la saisir).
        const { error: profilErr } = await supabase.from('profiles').upsert({
            id: userId,
            first_name: firstName || null,
            last_name: lastName || null,
            full_name: `${firstName} ${lastName}`.trim() || null,
            email: accountEmail,
            phone_number: phone,     // toujours en E.164 : c'est ainsi que Vapi cherche
        });
        if (profilErr) throw new Error(`upsert profiles : ${profilErr.message}`);

        // Préférences : valeurs par défaut UNIQUEMENT si absentes. Un client
        // qui recommande (ou rejoue le webhook) ne doit pas perdre le tutoiement
        // ou le style appris pendant ses appels.
        const { error: prefErr } = await supabase
            .from('profiles')
            .update({ politeness_preference: 'vous' })
            .eq('id', userId)
            .is('politeness_preference', null);
        if (prefErr) throw new Error(`défaut politeness : ${prefErr.message}`);
        const { error: styleErr } = await supabase
            .from('profiles')
            .update({ writing_style: DEFAULT_WRITING_STYLE })
            .eq('id', userId)
            .is('writing_style', null);
        if (styleErr) throw new Error(`défaut writing_style : ${styleErr.message}`);

        // ── Le projet ────────────────────────────────────────────────────────
        // Un seul livre « active » par personne (index projects_one_active_per_user).
        // Une personne qui recommande alors que son livre est en cours : le
        // nouveau livre attend (statut « paused » + queued_behind) et prend le relais quand le premier
        // est terminé (voir findActiveProject). Avant le 18/11/2026, l'insertion
        // échouait, était prise pour un doublon de Stripe, et la commande payée
        // ne créait rien.
        const { data: enCours, error: enCoursErr } = await supabase
            .from('projects')
            .select('id')
            .eq('user_id', userId)
            .eq('status', 'active')
            .limit(1);
        if (enCoursErr) throw new Error(`lecture projet en cours : ${enCoursErr.message}`);
        const queuedBehind = enCours?.[0]?.id ?? null;

        const { error: projetErr } = await supabase.from('projects').insert({
            user_id: userId,
            title: firstName ? `Biographie de ${firstName}` : 'Mon Livre de Vie',
            status: queuedBehind ? 'paused' : 'active',
            phase: 1,                // 1 = Vue d'ensemble. Un entier, plus de texte libre.
            phase_progress: 0,
            current_topic_id: 1,
            stripe_session_id: session.id,   // la garantie d'idempotence
            // L'acheteur peut être différent du narrateur (cadeau).
            project_metadata: {
                is_gift: isGift,
                buyer_email: email,
                call_minutes: normalizeCallMinutes(meta.callMinutes),
                ...(giver ? { giver } : {}),
                ...(family.length ? { family_members: storeFamilyMembers(family) } : {}),
                ...(extraOrder ? { extra_copies: [extraOrder] } : {}),
                ...(queuedBehind ? { queued_behind: queuedBehind } : {}),
                // Payée 0 € (code promo à 100 %) : une commande d'essai, sortie des chiffres de l'admin.
                ...(session.amount_total === 0 ? { test: true } : {}),
            },
        });

        if (projetErr) {
            // Course entre deux livraisons simultanées du même événement.
            // Seul le doublon de stripe_session_id est une course : toute autre
            // contrainte est une vraie erreur, que Stripe doit rejouer.
            if (projetErr.code === '23505' && /stripe_session_id/.test(`${projetErr.message} ${projetErr.details ?? ''}`)) {
                console.log(`[stripe] course détectée sur ${session.id} — rejeu ignoré`);
                return NextResponse.json({ received: true, duplicate: true });
            }
            throw new Error(`insert projects : ${projetErr.message}`);
        }

        console.log(`[stripe] compte et projet créés pour ${email} (phase 1)`);
        // Bienvenue au client (e-mail et SMS) et alerte à l'équipe. Une seule
        // fois : un rejeu de Stripe est arrêté plus haut. Ne lève jamais.
        await notifyNewOrder({ buyerEmail: email, narratorFirstName: firstName, narratorPhone: phone, isGift, giver, extraCopies });
        // Chaque proche ajouté reçoit son accès à l'espace famille.
        await Promise.allSettled(family.map((m) => notifyFamilyInvite({ phone: m.phone, firstName: m.firstName, narratorFirstName: firstName, invitedBy: giver?.first_name ?? null })));
        return NextResponse.json({ received: true, provisioned: true });

    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.error(`[stripe] ÉCHEC provisionnement session ${session.id} : ${message}`);
        // 500 → Stripe rejouera. Mieux qu'un faux succès et un client sans compte.
        return NextResponse.json({ error: 'provisioning_failed' }, { status: 500 });
    }
}

/**
 * Trouve ou crée le compte du narrateur.
 *
 * 1. Un profil existe déjà pour ce téléphone : c'est lui (nouvelle commande).
 * 2. Sinon on crée le compte avec l'e-mail de l'acheteur.
 * 3. Si cet e-mail a déjà un compte :
 *    - même narrateur (pas de téléphone, ou même téléphone) → ce compte ;
 *    - autre narrateur (cadeau pour quelqu'un d'autre) → nouveau compte avec
 *      l'adresse « acheteur+<téléphone>@… », qui arrive dans la même boîte.
 *
 * L'identifiant d'un compte existant est cherché côté authentification et
 * pas seulement dans `profiles` : si un essai précédent a créé le compte
 * puis échoué avant le profil, Stripe rejouait en boucle sans jamais aboutir.
 */
async function resolveNarratorAccount(params: {
    email: string;
    phone: string | null;
    firstName: string;
    lastName: string;
}): Promise<{ userId: string; email: string }> {
    const supabase = db();

    if (params.phone) {
        const byPhone = await findProfileByPhone(params.phone);
        if (byPhone) return { userId: byPhone.id, email: byPhone.email ?? params.email };
    }

    const create = async (email: string) =>
        supabase.auth.admin.createUser({
            email,
            email_confirm: true,
            user_metadata: { first_name: params.firstName, last_name: params.lastName },
        });

    const { data: created, error: createErr } = await create(params.email);
    if (!createErr && created.user) return { userId: created.user.id, email: params.email };

    const existingId = await findAuthUserIdByEmail(params.email);
    if (!existingId) {
        throw new Error(`création du compte impossible : ${createErr?.message ?? 'raison inconnue'}`);
    }

    const { data: profil } = await supabase
        .from('profiles')
        .select('phone_number')
        .eq('id', existingId)
        .maybeSingle();
    const existingPhone = (profil?.phone_number as string | null) ?? null;

    // Même narrateur, ou compte créé lors d'un essai précédent sans profil.
    if (!params.phone || !existingPhone || existingPhone === params.phone) {
        return { userId: existingId, email: params.email };
    }

    // Un autre narrateur avec le même e-mail d'acheteur : compte distinct.
    const [local, domain] = params.email.split('@');
    const alias = `${local}+${params.phone.replace(/\D/g, '')}@${domain}`;
    const { data: aliasUser, error: aliasErr } = await create(alias);
    if (!aliasErr && aliasUser.user) return { userId: aliasUser.user.id, email: alias };

    const aliasId = await findAuthUserIdByEmail(alias);
    if (aliasId) return { userId: aliasId, email: alias };
    throw new Error(`création du compte cadeau impossible : ${aliasErr?.message ?? 'raison inconnue'}`);
}

/** Recherche d'un compte d'authentification par e-mail (quelques centaines de comptes au plus). */
async function findAuthUserIdByEmail(email: string): Promise<string | null> {
    const target = email.trim().toLowerCase();
    for (let page = 1; page <= 20; page++) {
        const { data, error } = await db().auth.admin.listUsers({ page, perPage: 1000 });
        if (error) throw new Error(`lecture des comptes : ${error.message}`);
        const hit = data.users.find((u) => (u.email ?? '').toLowerCase() === target);
        if (hit) return hit.id;
        if (data.users.length < 1000) return null;
    }
    return null;
}

/**
 * Une commande commencée et jamais payée : le premier des trois e-mails de
 * relance part tout de suite (lib/loomina/abandoned-cart.ts, demande de Solal
 * du 23/11/2026 ; les deux suivants partent du rattrapage de /api/jobs/process).
 */
async function handleAbandonedCart(session: Stripe.Checkout.Session): Promise<void> {
    const email = session.metadata?.email?.trim();
    if (!email) return;
    const { results } = await relanceAbandonedCarts({ only: email, session });
    if (results.length) console.log(`[stripe] panier abandonné : ${results.join(', ')}`);
}

/**
 * Des exemplaires en plus payés depuis l'espace auteur ou famille : notés sur le livre
 * (project_metadata.extra_copies), une seule fois par paiement, et l'équipe est prévenue.
 * Lève en cas d'échec : Stripe rejouera.
 */
async function recordFamilyCopies(session: Stripe.Checkout.Session): Promise<void> {
    const meta = session.metadata ?? {};
    const copies = normalizeExtraCopies(meta.copies);
    const projectId = meta.projectId;
    if (!copies || !projectId) {
        console.error(`[stripe] exemplaires : session ${session.id} incomplète`);
        return;
    }
    const supabase = db();
    const { data: project, error } = await supabase.from('projects').select('id, title, project_metadata').eq('id', projectId).maybeSingle();
    if (error) throw new Error(`lecture projet : ${error.message}`);
    if (!project) {
        console.error(`[stripe] exemplaires : livre ${projectId} introuvable (session ${session.id})`);
        return;
    }
    const current = (project.project_metadata ?? {}) as Record<string, unknown>;
    const orders = extraCopiesOrders(current);
    if (orders.some((o) => o.stripe_session_id === session.id)) return; // rejeu de Stripe
    const unitPrice = Number.parseInt(meta.unitPrice ?? '', 10) || EXTRA_COPY.price;
    const by = meta.byPhone ? { first_name: meta.byFirstName?.trim() || null, phone: formatToE164(meta.byPhone) } : null;
    // L'adresse où envoyer ces exemplaires, demandée par Stripe.
    const ship = session.collected_information?.shipping_details ?? null;
    const a = ship?.address;
    const shipping = ship && a ? [ship.name, a.line1, a.line2, `${a.postal_code ?? ''} ${a.city ?? ''}`.trim(), a.country].filter(Boolean).join(', ') : null;
    const source: ExtraCopiesOrder['source'] = meta.source === 'auteur' ? 'auteur' : 'famille';
    const order: ExtraCopiesOrder = { copies, unit_price: unitPrice, source, stripe_session_id: session.id, at: new Date().toISOString(), by, shipping };
    const { error: upErr } = await supabase
        .from('projects')
        .update({ project_metadata: { ...current, extra_copies: [...orders, order] } })
        .eq('id', project.id);
    if (upErr) throw new Error(`mise à jour projet : ${upErr.message}`);

    const who = by?.first_name || (source === 'auteur' ? 'L’auteur' : 'Un proche');
    const book = project.title || 'un livre';
    const total = orders.reduce((n, o) => n + o.copies, 0) + copies;
    await alertTeam({
        subject: `${extraCopiesLabel(copies)} : ${book}`,
        text: `${who} a commandé ${extraCopiesLabel(copies)} (${unitPrice} € pièce) depuis l'espace ${source}, pour « ${book} ».\nTéléphone : ${by?.phone ?? 'non renseigné'}\nE-mail : ${session.customer_details?.email ?? 'non renseigné'}\nÀ envoyer à : ${shipping ?? 'avec le livre de l’auteur'}\nTotal à imprimer en plus du livre de l'auteur : ${total}.`,
        sms: `${extraCopiesLabel(copies)} commandés pour ${book}.`,
        replyTo: session.customer_details?.email ?? undefined,
    });
}
