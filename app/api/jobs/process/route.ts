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
 *   · Vercel Pro     → cron toutes les minutes (vercel.json)
 *   · Vercel Hobby   → cron limité à une fois par jour. Acceptable pour
 *                      démarrer, puisque c'est un filet et non le chemin
 *                      principal. Peut aussi être appelé à la main.
 *   · Manuellement   → curl -H "Authorization: Bearer $CRON_SECRET" \
 *                        https://www.loomina.eu/api/jobs/process
 */

import { NextRequest, NextResponse } from 'next/server';
import { sweepPending } from '@/lib/loomina/events';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300;

/**
 * Vercel Cron envoie automatiquement `Authorization: Bearer $CRON_SECRET`
 * quand la variable est définie sur le projet.
 */
function isAuthorized(request: NextRequest): boolean {
    const secret = process.env.CRON_SECRET?.trim();
    if (!secret) {
        console.warn('[jobs] CRON_SECRET non défini — endpoint OUVERT. À corriger.');
        return true;
    }
    const header = request.headers.get('authorization') ?? '';
    return header === `Bearer ${secret}`;
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

        return NextResponse.json({
            ok: true,
            picked,
            results,
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
