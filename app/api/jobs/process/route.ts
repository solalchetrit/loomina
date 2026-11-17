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

        // La veille de l'admin : clients à relancer signalés, avis de l'IA sur
        // un livre qui vient d'être terminé.
        const watch = { relances: await sweepRelanceAlerts(), reviews: await sweepReviews() };
        if (watch.relances || watch.reviews) console.info('[jobs] veille :', watch);

        return NextResponse.json({
            ok: true,
            picked,
            results,
            corrections,
            watch,
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
