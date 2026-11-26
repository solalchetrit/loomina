import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin/auth';
import { gatherRecap, lastSlot, recapRecipients, renderRecap, sendRecap, slotFor } from '@/lib/admin/recap';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 120;

/**
 * Le récap de 10 h et de 20 h, vu depuis l'admin (26/11/2026).
 *  - GET  /api/admin/recap : l'aperçu du dernier récap, tel qu'il est parti
 *    (ou partira), avec un bouton pour se l'envoyer tout de suite.
 *    `?jour=AAAA-MM-JJ&heure=10|20` pour un autre créneau.
 *  - POST : envoie ce récap maintenant, aux adresses du récap.
 */
function slotOf(params: URLSearchParams) {
    const day = params.get('jour') ?? '';
    const hour = params.get('heure');
    if (/^\d{4}-\d{2}-\d{2}$/.test(day) && (hour === '10' || hour === '20')) return slotFor(day, Number(hour) as 10 | 20);
    return lastSlot();
}

export async function GET(request: NextRequest) {
    if (!(await isAdmin())) return NextResponse.redirect(new URL('/admin/connexion', request.url), 303);
    const slot = slotOf(request.nextUrl.searchParams);
    const mail = renderRecap(await gatherRecap(slot));
    const sent = request.nextUrl.searchParams.get('envoye');
    const to = recapRecipients().join(', ');
    const bar =
        `<div style="position:sticky;top:0;z-index:2;background:#111;color:#eee;font:14px system-ui,sans-serif;padding:10px 16px;display:flex;gap:12px;align-items:center;flex-wrap:wrap">` +
        `<span>Aperçu · <strong>${mail.subject.replace(/</g, '&lt;')}</strong> · pour ${to.replace(/</g, '&lt;')}</span>` +
        `<form method="post" action="/api/admin/recap?jour=${slot.day}&heure=${slot.hour}" style="margin:0 0 0 auto"><button style="background:#ee9b2d;border:0;border-radius:99px;padding:7px 14px;font-weight:600;cursor:pointer">M’envoyer ce récap</button></form>` +
        (sent ? `<span style="width:100%;color:${sent === 'oui' ? '#8fd19e' : '#f59e9e'}">${sent === 'oui' ? 'Envoyé.' : 'L’e-mail n’est pas parti (boîte d’envoi indisponible).'}</span>` : '') +
        `</div>`;
    const html = mail.html.replace(/<body([^>]*)>/, `<body$1>${bar}`);
    return new NextResponse(html, { headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' } });
}

export async function POST(request: NextRequest) {
    if (!(await isAdmin())) return NextResponse.redirect(new URL('/admin/connexion', request.url), 303);
    const slot = slotOf(request.nextUrl.searchParams);
    const r = await sendRecap(slot);
    return NextResponse.redirect(new URL(`/api/admin/recap?jour=${slot.day}&heure=${slot.hour}&envoye=${r.ok ? 'oui' : 'non'}`, request.url), 303);
}
