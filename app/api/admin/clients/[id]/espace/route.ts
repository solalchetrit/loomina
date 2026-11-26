import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin/auth';
import { db } from '@/lib/loomina/db';
import { magicTokenMinutes } from '@/lib/loomina/magic-link';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * « Ouvrir son espace » (fiche client de l'admin, demande de Solal du
 * 26/11/2026 : « mets-moi sur le compte de Patricia »). L'admin ouvre
 * l'espace auteur du client comme s'il avait touché le lien d'un SMS :
 * un jeton de 5 minutes, jamais envoyé, consommé tout de suite par /l/<jeton>.
 * La session ouverte remplace, dans ce navigateur, celle de l'espace auteur
 * déjà ouvert (la session admin, elle, ne bouge pas).
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    if (!(await isAdmin())) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    const { id } = await params;
    const back = (msg: string) => NextResponse.redirect(new URL(`/admin/clients/${id}?erreur=${encodeURIComponent(msg)}`, request.url), 303);

    const { data } = await db().from('profiles').select('phone_number').eq('id', id).maybeSingle();
    const phone = typeof data?.phone_number === 'string' ? data.phone_number : null;
    if (!phone) return back('Ce client n’a pas de numéro : son espace ne peut pas s’ouvrir.');

    const token = magicTokenMinutes(phone, 5);
    if (!token) return back('Lien impossible : JWT_SECRET manque sur le site.');
    console.info('[admin] espace d’un client ouvert depuis l’admin');
    const res = NextResponse.redirect(new URL(`/l/${token}`, request.url), 303);
    res.headers.set('Referrer-Policy', 'no-referrer');
    res.headers.set('Cache-Control', 'no-store');
    return res;
}
