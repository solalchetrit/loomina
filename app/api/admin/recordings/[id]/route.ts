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
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    if (!(await isAdmin())) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    const { id } = await params;
    const { data } = await db().from('call_events').select('rec:payload->message->call->metadata->>recordingSid').eq('id', id).maybeSingle();
    const recordingSid = (data as { rec?: string | null } | null)?.rec;
    const sid = process.env.TWILIO_ACCOUNT_SID;
    const token = process.env.TWILIO_AUTH_TOKEN;
    if (!recordingSid || !/^RE[0-9a-f]{32}$/i.test(recordingSid) || !sid || !token) return NextResponse.json({ error: 'pas d’enregistrement' }, { status: 404 });

    const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Recordings/${recordingSid}.mp3`, {
        headers: { Authorization: 'Basic ' + Buffer.from(`${sid}:${token}`).toString('base64') },
    });
    if (!res.ok || !res.body) return NextResponse.json({ error: 'enregistrement introuvable chez Twilio' }, { status: 404 });
    return new NextResponse(res.body, { headers: { 'Content-Type': 'audio/mpeg', 'Cache-Control': 'private, max-age=3600' } });
}
