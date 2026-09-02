import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { formatToE164 } from '@/lib/phone';

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
        let userId: string | undefined;

        const { data: created, error: createErr } =
            await supabase.auth.admin.createUser({
                email,
                email_confirm: true,
                user_metadata: { first_name: firstName, last_name: lastName },
            });

        if (createErr) {
            // Le client a déjà commandé : on récupère son profil existant.
            console.log(`[stripe] compte existant pour ${email} — ${createErr.message}`);
            const { data: profil, error: profilErr } = await supabase
                .from('profiles')
                .select('id')
                .eq('email', email)
                .maybeSingle();
            if (profilErr) throw new Error(`lecture profiles : ${profilErr.message}`);
            userId = profil?.id;
        } else {
            userId = created.user?.id;
        }

        if (!userId) {
            throw new Error(`impossible de résoudre l'identifiant pour ${email}`);
        }

        // ── Le profil ────────────────────────────────────────────────────────
        // Identité : écrasée par la commande (le client vient de la saisir).
        const { error: profilErr } = await supabase.from('profiles').upsert({
            id: userId,
            first_name: firstName || null,
            last_name: lastName || null,
            full_name: `${firstName} ${lastName}`.trim() || null,
            email,
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
            project_metadata: { is_gift: isGift },
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
