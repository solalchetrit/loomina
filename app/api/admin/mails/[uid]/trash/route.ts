import { NextRequest } from 'next/server';
import { adminAction } from '@/lib/admin/action-route';
import { isFolder, trashMail } from '@/lib/admin/mailbox';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/** Met un message à la corbeille de la boîte (il y reste, rien n'est supprimé définitivement). */
export async function POST(request: NextRequest, { params }: { params: Promise<{ uid: string }> }) {
    const uid = Number((await params).uid);
    const dossier = new URL(request.url).searchParams.get('dossier');
    const folder = isFolder(dossier) ? dossier : 'inbox';
    return adminAction(request, `/admin/mails?dossier=${folder}`, async () => {
        if (!Number.isInteger(uid) || uid < 1) return { ok: false, message: 'Message inconnu.' };
        await trashMail(folder, uid);
        return { ok: true, message: 'Message mis à la corbeille.' };
    });
}
