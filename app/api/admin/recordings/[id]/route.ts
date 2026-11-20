import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin/auth';
import { db } from '@/lib/loomina/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * L'enregistrement audio d'un appel, pour l'admin seulement.
 * `id` est l'identifiant du rapport d'appel (call_events) : le fichier est
 * chez Twilio, on le relaie ici sans jamais exposer les identifiants Twilio.
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    if (!(await isAdmin())) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    const { id } = await params;
    // ?demo=1 : `id` est une démonstration (demo_stories), enregistrée depuis le 20/11/2026.
    const recordingSid = request.nextUrl.searchParams.get('demo') === '1'
        ? ((await db().from('demo_stories').select('recording_sid').eq('id', id).maybeSingle()).data as { recording_sid?: string | null } | null)?.recording_sid
        : ((await db().from('call_events').select('rec:payload->message->call->metadata->>recordingSid').eq('id', id).maybeSingle()).data as { rec?: string | null } | null)?.rec;
    const sid = process.env.TWILIO_ACCOUNT_SID;
    const token = process.env.TWILIO_AUTH_TOKEN;
    if (!recordingSid || !/^RE[0-9a-f]{32}$/i.test(recordingSid) || !sid || !token) return NextResponse.json({ error: 'pas d’enregistrement' }, { status: 404 });

    // Deux corrections (Solal, 20/11/2026) :
    // - mono : l'enregistrement est en deux pistes (l'appelant à gauche, Loomina
    //   à droite). Lu tel quel, on n'entend presque qu'une voix, surtout dans un
    //   seul écouteur. RequestedChannels=1 demande à Twilio les deux voix mêlées.
    // - longueur connue : relayé en flux, sans taille, le navigateur le prenait
    //   pour une diffusion en direct (pas de durée, pas d'avance). On renvoie le
    //   fichier entier avec sa taille, et la partie demandée quand on avance.
    const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Recordings/${recordingSid}.mp3?RequestedChannels=1`, {
        headers: { Authorization: 'Basic ' + Buffer.from(`${sid}:${token}`).toString('base64') },
    });
    if (!res.ok) return NextResponse.json({ error: 'enregistrement introuvable chez Twilio' }, { status: 404 });
    const audio = new Uint8Array(await res.arrayBuffer());
    const total = audio.byteLength;
    const base = { 'Content-Type': 'audio/mpeg', 'Accept-Ranges': 'bytes', 'Cache-Control': 'private, max-age=3600' };

    const range = /^bytes=(\d*)-(\d*)$/.exec(request.headers.get('range') ?? '');
    if (range && (range[1] || range[2])) {
        let start = range[1] ? Number(range[1]) : Math.max(0, total - Number(range[2]));
        let end = range[1] && range[2] ? Number(range[2]) : total - 1;
        end = Math.min(end, total - 1);
        if (start > end || start >= total) {
            return new NextResponse(null, { status: 416, headers: { ...base, 'Content-Range': `bytes */${total}` } });
        }
        start = Math.max(0, start);
        return new NextResponse(audio.slice(start, end + 1), {
            status: 206,
            headers: { ...base, 'Content-Range': `bytes ${start}-${end}/${total}`, 'Content-Length': String(end - start + 1) },
        });
    }
    return new NextResponse(audio, { headers: { ...base, 'Content-Length': String(total) } });
}
