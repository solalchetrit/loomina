import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin/auth';
import { isFolder, readAttachment } from '@/lib/admin/mailbox';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/** Télécharger une pièce jointe d'un message de la boîte (admin seulement). */
export async function GET(request: NextRequest) {
    if (!(await isAdmin())) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    const sp = request.nextUrl.searchParams;
    const folder = sp.get('folder');
    const uid = Number(sp.get('uid'));
    const i = Number(sp.get('i'));
    if (!isFolder(folder) || !Number.isInteger(uid) || !Number.isInteger(i)) return NextResponse.json({ error: 'paramètres' }, { status: 400 });
    const a = await readAttachment(folder, uid, i).catch(() => null);
    if (!a) return NextResponse.json({ error: 'pièce jointe introuvable' }, { status: 404 });
    const name = a.filename.replace(/["\\\r\n]/g, '_');
    return new NextResponse(new Uint8Array(a.content), {
        headers: {
            'Content-Type': a.contentType,
            'Content-Disposition': `inline; filename="${name.replace(/[^\x20-\x7e]/g, '_')}"; filename*=UTF-8''${encodeURIComponent(name)}`,
            'Cache-Control': 'private, no-store',
            'X-Content-Type-Options': 'nosniff',
        },
    });
}
