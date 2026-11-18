/**
 * La boîte contact@loomina.eu dans l'admin (demande de Solal, 18/11/2026,
 * sur le modèle du webmail de L'Étincelle) : lire, répondre, écrire, mettre
 * à la corbeille. La boîte reste chez l'hébergeur (o2switch) : rien n'est
 * copié dans la base, on la lit en direct (IMAP) et on envoie par elle (SMTP).
 *
 * Mêmes identifiants que l'envoi des e-mails du site : `SMTP_USER`
 * (contact@loomina.eu par défaut) et `SMTP_PASS`.
 */

import { ImapFlow } from 'imapflow';
import { simpleParser } from 'mailparser';
import type { AddressObject } from 'mailparser';

export type Folder = 'inbox' | 'sent' | 'spam' | 'trash';
export const FOLDERS: Array<{ key: Folder; label: string }> = [
    { key: 'inbox', label: 'Reçus' },
    { key: 'sent', label: 'Envoyés' },
    { key: 'spam', label: 'Indésirables' },
    { key: 'trash', label: 'Corbeille' },
];
export const isFolder = (v: unknown): v is Folder => FOLDERS.some((f) => f.key === v);

export interface MailRow {
    uid: number;
    from: string;
    to: string;
    subject: string;
    date: string;
    seen: boolean;
    answered: boolean;
    attachments: boolean;
}

export interface MailFull extends MailRow {
    fromAddress: string;
    cc: string;
    text: string;
    /** Le message mis en forme, nettoyé de tout script. Affiché dans un cadre isolé. */
    html: string | null;
    messageId: string | null;
    references: string[];
    files: Array<{ name: string; size: number }>;
}

export function mailboxUser(): string {
    return process.env.SMTP_USER?.trim() || 'contact@loomina.eu';
}

export function mailboxConfigured(): boolean {
    return Boolean(process.env.SMTP_PASS?.trim());
}

function connection() {
    const pass = process.env.SMTP_PASS?.trim();
    if (!pass) throw new Error('Le mot de passe de la boîte (SMTP_PASS) n’est pas posé sur Vercel.');
    return {
        host: process.env.IMAP_HOST?.trim() || process.env.SMTP_HOST?.trim() || 'epinoche.o2switch.net',
        port: Number(process.env.IMAP_PORT?.trim() || 993),
        user: mailboxUser(),
        pass,
    };
}

async function withImap<T>(fn: (client: ImapFlow) => Promise<T>): Promise<T> {
    const c = connection();
    const client = new ImapFlow({
        host: c.host,
        port: c.port,
        secure: c.port === 993,
        auth: { user: c.user, pass: c.pass },
        logger: false,
        socketTimeout: 30_000,
        connectionTimeout: 15_000,
        greetingTimeout: 15_000,
    });
    client.on('error', () => {});
    await client.connect();
    try {
        return await fn(client);
    } finally {
        await client.logout().catch(() => client.close());
    }
}

const NAMES: Record<Exclude<Folder, 'inbox'>, { use: string; names: string[] }> = {
    sent: { use: '\\Sent', names: ['sent', 'inbox.sent', 'sent items', 'envoyés', 'éléments envoyés'] },
    spam: { use: '\\Junk', names: ['spam', 'inbox.spam', 'junk', 'inbox.junk', 'courrier indésirable'] },
    trash: { use: '\\Trash', names: ['trash', 'inbox.trash', 'corbeille', 'deleted items'] },
};

/** Le chemin réel d'un dossier sur le serveur (ils ne portent pas le même nom partout). */
async function folderPath(client: ImapFlow, folder: Folder): Promise<string | null> {
    if (folder === 'inbox') return 'INBOX';
    const list = await client.list();
    const want = NAMES[folder];
    const found = list.find((f) => f.specialUse === want.use) ?? list.find((f) => want.names.includes(f.path.toLowerCase()) || want.names.includes(f.name.toLowerCase()));
    return found?.path ?? null;
}

const people = (list?: Array<{ name?: string; address?: string }>): string =>
    (list ?? []).map((a) => (a.name ? `${a.name} <${a.address ?? ''}>` : a.address ?? '')).filter(Boolean).join(', ');

const parsedPeople = (a?: AddressObject | AddressObject[]): string =>
    (Array.isArray(a) ? a : a ? [a] : []).flatMap((x) => x.value).map((v) => (v.name ? `${v.name} <${v.address ?? ''}>` : v.address ?? '')).filter(Boolean).join(', ');

function hasAttachment(node: unknown): boolean {
    const n = node as { disposition?: string; childNodes?: unknown[] } | undefined;
    if (!n) return false;
    if (n.disposition === 'attachment') return true;
    return (n.childNodes ?? []).some(hasAttachment);
}

/** Les messages d'un dossier, du plus récent au plus ancien, par pages. */
export async function listMails(folder: Folder, page = 1, perPage = 30): Promise<{ total: number; unseen: number; messages: MailRow[]; missing: boolean }> {
    return withImap(async (client) => {
        const path = await folderPath(client, folder);
        if (!path) return { total: 0, unseen: 0, messages: [], missing: true };
        const lock = await client.getMailboxLock(path);
        try {
            const total = (client.mailbox && client.mailbox.exists) || 0;
            const status = await client.status(path, { unseen: true }).catch(() => ({ unseen: 0 }));
            const messages: MailRow[] = [];
            const offset = (Math.max(1, page) - 1) * perPage;
            if (total > offset) {
                const to = total - offset;
                const from = Math.max(1, to - perPage + 1);
                for await (const m of client.fetch(`${from}:${to}`, { uid: true, envelope: true, flags: true, internalDate: true, bodyStructure: true })) {
                    messages.push({
                        uid: m.uid,
                        from: people(m.envelope?.from),
                        to: people(m.envelope?.to),
                        subject: m.envelope?.subject || '(sans objet)',
                        date: new Date(m.envelope?.date ?? m.internalDate ?? Date.now()).toISOString(),
                        seen: m.flags?.has('\\Seen') ?? false,
                        answered: m.flags?.has('\\Answered') ?? false,
                        attachments: hasAttachment(m.bodyStructure),
                    });
                }
            }
            messages.sort((a, b) => b.date.localeCompare(a.date));
            return { total, unseen: (status && status.unseen) || 0, messages, missing: false };
        } finally {
            lock.release();
        }
    });
}

/** Retire tout ce qui pourrait s'exécuter. Le message est en plus affiché dans un cadre isolé. */
export function sanitizeHtml(html: string): string {
    return html
        .replace(/<script[\s\S]*?<\/script>/gi, '')
        .replace(/<(iframe|object|embed|form)[\s\S]*?<\/\1>/gi, '')
        .replace(/<(iframe|object|embed|meta|link|base)\b[^>]*>/gi, '')
        .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
        .replace(/(href|src)\s*=\s*(["'])\s*javascript:[^"']*\2/gi, '$1="#"');
}

/** Un message en entier. Le lire le marque comme lu. */
export async function readMail(folder: Folder, uid: number): Promise<MailFull | null> {
    return withImap(async (client) => {
        const path = await folderPath(client, folder);
        if (!path) return null;
        const lock = await client.getMailboxLock(path);
        try {
            const m = await client.fetchOne(String(uid), { uid: true, source: true, flags: true }, { uid: true });
            if (!m || !m.source) return null;
            await client.messageFlagsAdd(String(uid), ['\\Seen'], { uid: true }).catch(() => {});
            const p = await simpleParser(m.source);
            const refs = Array.isArray(p.references) ? p.references : p.references ? [p.references] : [];
            return {
                uid,
                from: parsedPeople(p.from),
                fromAddress: p.from?.value?.[0]?.address ?? '',
                to: parsedPeople(p.to),
                cc: parsedPeople(p.cc),
                subject: p.subject || '(sans objet)',
                date: (p.date ?? new Date()).toISOString(),
                seen: true,
                answered: m.flags?.has('\\Answered') ?? false,
                attachments: p.attachments.length > 0,
                text: (p.text ?? '').trim(),
                html: typeof p.html === 'string' ? sanitizeHtml(p.html) : null,
                messageId: p.messageId ?? null,
                references: refs,
                files: p.attachments.map((a) => ({ name: a.filename ?? 'pièce jointe', size: a.size })),
            };
        } finally {
            lock.release();
        }
    });
}

/** Range une copie d'un message envoyé dans « Envoyés ». Ne lève pas. */
export async function saveToSent(raw: Buffer | string): Promise<void> {
    try {
        await withImap(async (client) => {
            const sent = await folderPath(client, 'sent');
            if (sent) await client.append(sent, raw, ['\\Seen']);
        });
    } catch (err) {
        console.warn('[boîte] copie dans « Envoyés » impossible :', err instanceof Error ? err.message : String(err));
    }
}

export interface Outgoing {
    to: string;
    subject: string;
    text: string;
    /** Réponse : le message auquel on répond (pour le fil de discussion et le drapeau « répondu »). */
    replyTo?: { folder: Folder; uid: number; messageId: string | null; references: string[] };
}

/** Envoie un e-mail depuis la boîte, garde la copie dans « Envoyés », marque l'original comme répondu. */
export async function sendFromMailbox(mail: Outgoing): Promise<void> {
    const c = connection();
    const { createTransport } = await import('nodemailer');
    const smtpPort = Number(process.env.SMTP_PORT?.trim() || 465);
    const message = {
        from: process.env.LOOMINA_MAIL_FROM?.trim() || `Loomina <${c.user}>`,
        to: mail.to,
        subject: mail.subject.slice(0, 250),
        text: mail.text,
        ...(mail.replyTo?.messageId ? { inReplyTo: mail.replyTo.messageId, references: [...mail.replyTo.references, mail.replyTo.messageId] } : {}),
    };
    const transporter = createTransport({
        host: process.env.SMTP_HOST?.trim() || 'epinoche.o2switch.net',
        port: smtpPort,
        secure: smtpPort === 465,
        auth: { user: c.user, pass: c.pass },
        connectionTimeout: 15_000,
        greetingTimeout: 15_000,
        socketTimeout: 30_000,
    });
    const info = await transporter.sendMail(message);

    // La copie exacte du message envoyé, pour le dossier « Envoyés ».
    const raw = await new Promise<Buffer>((resolve, reject) =>
        createTransport({ streamTransport: true, buffer: true }).sendMail({ ...message, messageId: info.messageId, date: new Date() }, (err, r) => (err ? reject(err) : resolve(r.message as Buffer)))
    ).catch(() => null);
    if (raw) await saveToSent(raw);

    if (mail.replyTo) {
        const { folder, uid } = mail.replyTo;
        await withImap(async (client) => {
            const path = await folderPath(client, folder);
            if (!path) return;
            const lock = await client.getMailboxLock(path);
            try {
                await client.messageFlagsAdd(String(uid), ['\\Answered', '\\Seen'], { uid: true });
            } finally {
                lock.release();
            }
        }).catch(() => {});
    }
}

/** Met un message à la corbeille (rien n'est supprimé définitivement). */
export async function trashMail(folder: Folder, uid: number): Promise<void> {
    await withImap(async (client) => {
        const path = await folderPath(client, folder);
        const trash = await folderPath(client, 'trash');
        if (!path || !trash) throw new Error('Dossier introuvable sur le serveur de messagerie.');
        if (path === trash) throw new Error('Ce message est déjà dans la corbeille.');
        const lock = await client.getMailboxLock(path);
        try {
            await client.messageMove(String(uid), trash, { uid: true });
        } finally {
            lock.release();
        }
    });
}

/** Le texte cité sous une réponse. */
export function quote(mail: Pick<MailFull, 'from' | 'date' | 'text'>): string {
    const when = new Date(mail.date).toLocaleString('fr-FR', { timeZone: 'Europe/Paris', dateStyle: 'long', timeStyle: 'short' });
    return `\n\n\nLe ${when}, ${mail.from} a écrit :\n${mail.text.split('\n').map((l) => `> ${l}`).join('\n')}`;
}
