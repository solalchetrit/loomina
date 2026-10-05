import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { formatToE164 } from '@/lib/phone';
import { findProfileByPhone } from '@/lib/loomina/db';

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

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

/**
 * Service role obligatoire : `auth.admin.createUser` l'exige, et les tables
 * sont en RLS sans policy. Avec la clé anon, tout échouerait silencieusement.
 */
function db() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
        throw new Error(
            'SUPABASE_SERVICE_ROLE_KEY ou NEXT_PUBLIC_SUPABASE_URL manquante : ' +
            'provisionnement impossible.'
        );
    }
    return createClient(url, key, { auth: { persistSession: false } });
}

export async function POST(request: NextRequest) {
    const payload = await request.text();
    const sig = request.headers.get('stripe-signature');

    let event: Stripe.Event;
    try {
        if (!sig || !endpointSecret) {
            console.error('[stripe] signature ou secret absent');
            return NextResponse.json({ error: 'configuration' }, { status: 400 });
        }
        event = stripe.webhooks.constructEvent(payload, sig, endpointSecret);
    } catch (err) {
        console.error('[stripe] signature invalide', err);
        return NextResponse.json({ error: 'signature' }, { status: 400 });
    }

    if (event.type !== 'checkout.session.completed') {
        return NextResponse.json({ received: true });
    }

    const session = event.data.object as Stripe.Checkout.Session;
    const meta = session.metadata ?? {};
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
        const accountEmail = resolved.email;

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
            .update({ writing_style: 'Naturel' })
            .eq('id', userId)
            .is('writing_style', null);
        if (styleErr) throw new Error(`défaut writing_style : ${styleErr.message}`);

        // ── Le projet ────────────────────────────────────────────────────────
        const { error: projetErr } = await supabase.from('projects').insert({
            user_id: userId,
            title: firstName ? `Biographie de ${firstName}` : 'Mon Livre de Vie',
            status: 'active',
            phase: 1,                // 1 = Vue d'ensemble. Un entier, plus de texte libre.
            phase_progress: 0,
            current_topic_id: 1,
            stripe_session_id: session.id,   // la garantie d'idempotence
            // L'acheteur peut être différent du narrateur (cadeau).
            project_metadata: { is_gift: isGift, buyer_email: email },
        });

        if (projetErr) {
            // Course entre deux livraisons simultanées du même événement.
            if (projetErr.code === '23505') {
                console.log(`[stripe] course détectée sur ${session.id} — rejeu ignoré`);
                return NextResponse.json({ received: true, duplicate: true });
            }
            throw new Error(`insert projects : ${projetErr.message}`);
        }

        console.log(`[stripe] compte et projet créés pour ${email} (phase 1)`);
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
