/**
 * Le worker de rattrapage.
 *
 * Le chemin nominal est le `after()` du webhook : un appel est traité
 * dans les secondes qui suivent le raccroché. Ce worker n'existe que
 * pour les cas où ce chemin a échoué — coupure OpenAI, erreur Supabase
 * transitoire, instance interrompue.
 *
 * Autrement dit : si ce worker ne trouve jamais rien à faire, tout va bien.
 *
 * DÉCLENCHEMENT
 *   · Serveur vocal  → toutes les 5 minutes (voice/src/scheduler.ts), avec le
 *                      secret qu'il partage déjà avec le site pour les rapports
 *                      d'appel (`x-vapi-secret`). C'est le rattrapage courant.
 *   · Vercel Hobby   → cron une fois par jour, à 3 h : le filet du filet, si
 *                      le serveur vocal est lui-même arrêté.
 *   · Manuellement   → curl -H "Authorization: Bearer $CRON_SECRET" \
 *                        https://www.loomina.eu/api/jobs/process
 */

import { NextRequest, NextResponse } from 'next/server';
import { sweepPending } from '@/lib/loomina/events';
import { sweepCorrections } from '@/lib/loomina/corrections';
import { sweepReviews, sweepRelanceAlerts } from '@/lib/admin/watch';
import { checkSharedSecret } from '@/lib/loomina/secret';
import { sweepDemoStories, sweepDemoReminders } from '@/lib/loomina/demo-story';
import { relanceAbandonedCarts } from '@/lib/loomina/abandoned-cart';
import { sweepRecap } from '@/lib/admin/recap';
import { sweepEditions } from '@/lib/loomina/book-edition';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300;

/**
 * Deux appelants autorisés :
 * - Vercel Cron, qui envoie `Authorization: Bearer $CRON_SECRET` ;
 * - le serveur vocal, qui envoie `x-vapi-secret`, le secret qu'il partage
 *   déjà avec le site. Aucun secret de plus à recopier d'un côté à l'autre.
 */
function isAuthorized(request: NextRequest): boolean {
    const shared = request.headers.get('x-vapi-secret');
    if (shared) return checkSharedSecret(shared, process.env.VAPI_WEBHOOK_SECRET, 'jobs');
    const header = request.headers.get('authorization') ?? '';
    const provided = header.replace(/^Bearer\s+/i, '');
    return checkSharedSecret(provided, process.env.CRON_SECRET, 'jobs');
}

async function handle(request: NextRequest) {
    if (!isAuthorized(request)) {
        return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }

    const startedAt = Date.now();

    try {
        // 10 événements par passage : bien au-delà du volume attendu
        // (5 clients × 14 appels ≈ 70 appels par mois), et loin des
        // 300 s de budget.
        const { picked, results } = await sweepPending(10);

        if (picked > 0) {
            console.info(`[jobs] ${picked} événement(s) repris :`, results);
        }

        // Les remarques des auteurs sur leurs récits, appliquées par l'IA
        // quelques minutes après avoir été écrites.
        const corrections = await sweepCorrections();
        if (corrections.applied || corrections.failed) console.info('[jobs] remarques d’auteur :', corrections);

        // Les récits de démo en échec (OpenAI à sec…) ou dont le SMS n'est pas parti.
        const demos = await sweepDemoStories();
        if (demos.retried || demos.sms) console.info('[jobs] récits de démo :', demos.results);

        // La veille de l'admin : clients à relancer signalés (et relancés tout
        // seuls après 14 jours sans appel), avis de l'IA sur un livre terminé.
        const watch = { relances: await sweepRelanceAlerts(), reviews: await sweepReviews() };
        if (watch.relances || watch.reviews) console.info('[jobs] veille :', watch);

        // Les e-mails de relance (23/11/2026) : paniers abandonnés (2e et 3e
        // e-mails) et fin de la réduction d'une démo sans commande.
        const carts = await relanceAbandonedCarts();
        const reminders = await sweepDemoReminders();
        if (carts.results.length || reminders.results.length) console.info('[jobs] relances :', { carts: carts.results, reminders: reminders.results });

        // Le récap de 10 h et de 20 h par e-mail (26/11/2026), une seule fois par créneau.
        const recap = await sweepRecap();
        if (recap) console.info('[jobs] récap envoyé :', recap);

        // Les livres arrêtés en cours d'écriture (chaîne cassée par Vercel ou par un
        // déploiement) : repris ici, s'il reste du temps (une étape dure jusqu'à 2 min).
        let editions = { resumed: 0 };
        if (Date.now() - startedAt < 120_000) {
            editions = await sweepEditions(request.nextUrl.origin, 1).catch((err) => {
                console.error('[jobs] livres arrêtés :', err instanceof Error ? err.message : String(err));
                return { resumed: 0 };
            });
            if (editions.resumed) console.info('[jobs] livre(s) repris :', editions.resumed);
        }

        return NextResponse.json({
            ok: true,
            editions: editions.resumed,
            recap,
            picked,
            results,
            corrections,
            demos,
            watch,
            carts: carts.sent,
            reminders: reminders.sent,
            durationMs: Date.now() - startedAt,
        });
    } catch (err) {
        const detail = err instanceof Error ? err.message : String(err);
        console.error('[jobs] Erreur du worker :', detail);
        return NextResponse.json({ ok: false, error: detail }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    return handle(request);
}

export async function POST(request: NextRequest) {
    return handle(request);
}
