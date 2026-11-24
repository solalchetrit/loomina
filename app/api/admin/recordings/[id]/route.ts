import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin/auth';
import { db } from '@/lib/loomina/db';
import { recordingUrl } from '@/lib/admin/recording';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 120;

/**
 * L'enregistrement audio d'un appel, pour l'admin seulement.
 * `id` est l'identifiant du rapport d'appel (call_events), ou d'une démo avec ?demo=1.
 *
 * 24/11/2026 (Solal : « les audios mettent énormément de temps à charger ») :
 * le MP3 mono (les deux voix mêlées) est copié une fois dans notre seau privé,
 * puis on renvoie vers un lien signé d'une heure. La lecture démarre tout de
 * suite et l'on peut avancer où l'on veut. Les identifiants Twilio ne sont
 * jamais exposés.
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    if (!(await isAdmin())) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    const { id } = await params;
    const recordingSid = request.nextUrl.searchParams.get('demo') === '1'
        ? ((await db().from('demo_stories').select('recording_sid').eq('id', id).maybeSingle()).data as { recording_sid?: string | null } | null)?.recording_sid
        : ((await db().from('call_events').select('rec:payload->message->call->metadata->>recordingSid').eq('id', id).maybeSingle()).data as { rec?: string | null } | null)?.rec;
    if (!recordingSid) return NextResponse.json({ error: 'pas d’enregistrement' }, { status: 404 });
    const url = await recordingUrl(recordingSid);
    if (!url) return NextResponse.json({ error: 'enregistrement introuvable chez Twilio' }, { status: 404 });
    return NextResponse.redirect(url, { status: 302, headers: { 'Cache-Control': 'private, no-store' } });
}
