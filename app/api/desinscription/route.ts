import { NextRequest, NextResponse } from 'next/server';
import { isOptOutToken, recordOptOut, removeOptOut } from '@/lib/loomina/optout';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * « Ne plus recevoir ces rappels » (lib/loomina/optout.ts).
 *
 * Deux façons d'arriver ici, toutes deux en POST (un GET ne désinscrit
 * jamais : les messageries ouvrent les liens toutes seules pour les vérifier) :
 *  - le bouton de la page /desinscription ;
 *  - la désinscription en un clic des messageries (en-tête List-Unsubscribe-Post).
 */
export async function POST(request: NextRequest) {
    const url = new URL(request.url);
    let token = url.searchParams.get('t');
    let oneClick = false;
    let undo = false;
    try {
        const form = await request.formData();
        token = (form.get('t') as string | null) ?? token;
        oneClick = form.get('List-Unsubscribe') === 'One-Click';
        undo = form.get('action') === 'reabonner';
    } catch {
        /* corps vide ou illisible : le jeton de l'adresse suffit */
    }
    if (undo) {
        // « Annuler ma désinscription » : on se réabonne (25/11/2026).
        const back = isOptOutToken(token) && (await removeOptOut(token));
        return NextResponse.redirect(new URL(`/desinscription?${back ? `retour=1&t=${token}` : 'erreur=1'}`, request.url), 303);
    }
    const ok = isOptOutToken(token) && (await recordOptOut(token));
    if (oneClick) return new NextResponse(ok ? 'ok' : 'erreur', { status: ok ? 200 : 400 });
    return NextResponse.redirect(new URL(`/desinscription?${ok ? `fait=1&t=${token}` : 'erreur=1'}`, request.url), 303);
}

/** Un lien ouvert à la main : la page qui demande de confirmer. */
export async function GET(request: NextRequest) {
    const t = new URL(request.url).searchParams.get('t');
    return NextResponse.redirect(new URL(isOptOutToken(t) ? `/desinscription?t=${t}` : '/desinscription', request.url), 303);
}
