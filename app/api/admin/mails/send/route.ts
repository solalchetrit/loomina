import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/admin/auth';
import { isFolder, readMail, sendFromMailbox } from '@/lib/admin/mailbox';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/** Envoie un message écrit dans l'admin (nouveau message ou réponse). */
export async function POST(request: NextRequest) {
    if (!(await isAdmin())) return NextResponse.redirect(new URL('/admin/connexion', request.url), 303);
    const form = await request.formData();
    const to = String(form.get('to') ?? '').trim();
    const subject = String(form.get('subject') ?? '').trim();
    const text = String(form.get('text') ?? '').replace(/\r\n/g, '\n').trim();
    const replyFolder = form.get('reply_folder');
    const replyUid = Number(form.get('reply_uid'));
    const isReply = isFolder(replyFolder) && Number.isInteger(replyUid) && replyUid > 0;
    const back = (message: string) => {
        const url = new URL(isReply ? `/admin/mails/${replyUid}?dossier=${replyFolder}` : '/admin/mails/nouveau', request.url);
        url.searchParams.set('erreur', message.slice(0, 300));
        if (!isReply) {
            url.searchParams.set('a', to);
            url.searchParams.set('objet', subject);
        }
        return NextResponse.redirect(url, 303);
    };

    if (!/^[^\s@,;]+@[^\s@,;]+\.[^\s@,;]{2,}$/.test(to)) return back('L’adresse du destinataire ne semble pas valide (une seule adresse).');
    if (!subject || !text) return back('Il faut un objet et un message.');
    if (text.length > 100_000) return back('Message trop long.');

    try {
        let replyTo;
        if (isReply) {
            const original = await readMail(replyFolder, replyUid);
            replyTo = { folder: replyFolder, uid: replyUid, messageId: original?.messageId ?? null, references: original?.references ?? [] };
        }
        await sendFromMailbox({ to, subject, text, replyTo });
    } catch (err) {
        console.error('[admin/mails] envoi impossible :', err);
        return back(`L’envoi n’a pas abouti : ${err instanceof Error ? err.message : 'erreur inattendue'}`);
    }
    const done = new URL('/admin/mails', request.url);
    done.searchParams.set('fait', `Message envoyé à ${to}.`);
    return NextResponse.redirect(done, 303);
}
