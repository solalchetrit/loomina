/**
 * La boîte contact@loomina.eu dans l'admin, sur le modèle du webmail de
 * L'Étincelle (demande de Solal, 18/11/2026). La boîte reste chez l'hébergeur
 * (o2switch) : rien n'est copié dans la base, on la lit en direct (IMAP) et on
 * envoie par elle (SMTP), avec les mêmes identifiants que les e-mails du site
 * (`SMTP_USER`, `SMTP_PASS`).
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

export interface Address {
    name: string;
    address: string;
}

export interface MailRow {
    uid: number;
    from: Address;
    to: Address[];
    subject: string;
    date: string;
    seen: boolean;
    answered: boolean;
    flagged: boolean;
    attach: boolean;
}

export interface MailList {
    folder: Folder;
    total: number;
    unseen: number;
    messages: MailRow[];
}

export interface MailFull {
    uid: number;
    from: Address[];
    to: Address[];
    cc: Address[];
    replyTo: Address[];
    subject: string;
    date: string;
    flagged: boolean;
    text: string;
    /** Nettoyé de tout script ; affiché dans un cadre isolé. */
    html: string;
    messageId: string | null;
    references: string[];
    attachments: Array<{ i: number; filename: string; size: number; contentType: string }>;
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

async function inFolder<T>(folder: Folder, fn: (client: ImapFlow, path: string) => Promise<T>): Promise<T> {
    return withImap(async (client) => {
        const path = await folderPath(client, folder);
        if (!path) throw new Error('Ce dossier n’existe pas dans la boîte.');
        const lock = await client.getMailboxLock(path);
        try {
            return await fn(client, path);
        } finally {
            lock.release();
        }
    });
}

const addr = (a?: { name?: string; address?: string }): Address => ({ name: (a?.name ?? '').trim(), address: (a?.address ?? '').toLowerCase() });
const parsedAddrs = (a?: AddressObject | AddressObject[]): Address[] => (Array.isArray(a) ? a : a ? [a] : []).flatMap((x) => x.value).map(addr).filter((x) => x.address);

function hasAttachment(node: unknown): boolean {
    const n = node as { disposition?: string; childNodes?: unknown[] } | undefined;
    if (!n) return false;
    if (n.disposition === 'attachment') return true;
    return (n.childNodes ?? []).some(hasAttachment);
}

type Fetched = { uid: number; envelope?: { from?: Array<{ name?: string; address?: string }>; to?: Array<{ name?: string; address?: string }>; subject?: string; date?: Date }; flags?: Set<string>; internalDate?: Date | string; bodyStructure?: unknown };
const row = (m: Fetched): MailRow => ({
    uid: m.uid,
    from: addr(m.envelope?.from?.[0]),
    to: (m.envelope?.to ?? []).map(addr),
    subject: m.envelope?.subject || '(sans objet)',
    date: new Date(m.envelope?.date ?? m.internalDate ?? Date.now()).toISOString(),
    seen: m.flags?.has('\\Seen') ?? false,
    answered: m.flags?.has('\\Answered') ?? false,
    flagged: m.flags?.has('\\Flagged') ?? false,
    attach: hasAttachment(m.bodyStructure),
});
const QUERY = { uid: true, envelope: true, flags: true, internalDate: true, bodyStructure: true } as const;

/** Les messages d'un dossier, du plus récent au plus ancien (`offset` : déjà affichés). */
export async function listMails(folder: Folder, offset = 0, limit = 40): Promise<MailList> {
    return withImap(async (client) => {
        const path = await folderPath(client, folder);
        if (!path) return { folder, total: 0, unseen: 0, messages: [] };
        const lock = await client.getMailboxLock(path);
        try {
            const total = (client.mailbox && client.mailbox.exists) || 0;
            const status = await client.status(path, { unseen: true }).catch(() => null);
            const messages: MailRow[] = [];
            if (total > offset) {
                const to = total - offset;
                const from = Math.max(1, to - limit + 1);
                for await (const m of client.fetch(`${from}:${to}`, QUERY)) messages.push(row(m as Fetched));
            }
            messages.sort((a, b) => b.date.localeCompare(a.date));
            return { folder, total, unseen: (status && status.unseen) || 0, messages };
        } finally {
            lock.release();
        }
    });
}

/** Recherche dans l'expéditeur, le destinataire et l'objet. */
export async function searchMails(folder: Folder, q: string): Promise<MailList> {
    return inFolder(folder, async (client) => {
        const found = await client.search({ or: [{ from: q }, { to: q }, { subject: q }] }, { uid: true });
        const uids = (Array.isArray(found) ? found : []).slice(-100);
        const messages: MailRow[] = [];
        if (uids.length) for await (const m of client.fetch(uids.join(','), QUERY, { uid: true })) messages.push(row(m as Fetched));
        messages.sort((a, b) => b.date.localeCompare(a.date));
        return { folder, total: messages.length, unseen: 0, messages };
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

async function fetchParsed(folder: Folder, uid: number, markSeen: boolean) {
    return inFolder(folder, async (client) => {
        const m = await client.fetchOne(String(uid), { uid: true, source: true, flags: true }, { uid: true });
        if (!m || !m.source) throw new Error('Message introuvable (il a peut-être été déplacé).');
        if (markSeen) await client.messageFlagsAdd(String(uid), ['\\Seen'], { uid: true }).catch(() => {});
        return { parsed: await simpleParser(m.source), flags: m.flags };
    });
}

/** Les images intégrées (cid:) remplacées par leur contenu, jusqu'à 3 Mo : le message s'affiche tel qu'envoyé. */
function inlineCids(html: string, attachments: Array<{ cid?: string; contentType: string; content: Buffer; size: number }>): string {
    let budget = 3 * 1024 * 1024;
    return html.replace(/(["'(])cid:([^"')\s>]+)/gi, (all, q: string, cid: string) => {
        const a = attachments.find((x) => x.cid && x.cid.replace(/[<>]/g, '') === cid);
        if (!a || a.size > budget) return all;
        budget -= a.size;
        return `${q}data:${a.contentType};base64,${a.content.toString('base64')}`;
    });
}

/** Un message en entier. Le lire le marque comme lu. */
export async function readMail(folder: Folder, uid: number): Promise<MailFull> {
    const { parsed: p, flags } = await fetchParsed(folder, uid, true);
    const refs = Array.isArray(p.references) ? p.references : p.references ? [p.references] : [];
    const html = typeof p.html === 'string' ? sanitizeHtml(inlineCids(p.html, p.attachments)) : '';
    return {
        uid,
        from: parsedAddrs(p.from),
        to: parsedAddrs(p.to),
        cc: parsedAddrs(p.cc),
        replyTo: parsedAddrs(p.replyTo),
        subject: p.subject || '(sans objet)',
        date: (p.date ?? new Date()).toISOString(),
        flagged: flags?.has('\\Flagged') ?? false,
        text: (p.text ?? '').trim(),
        html,
        messageId: p.messageId ?? null,
        references: refs,
        attachments: p.attachments
            .map((a, i) => ({ i, filename: a.filename ?? 'pièce jointe', size: a.size, contentType: a.contentType, inline: a.contentDisposition === 'inline' && !!a.cid }))
            .filter((a) => !a.inline)
            .map(({ i, filename, size, contentType }) => ({ i, filename, size, contentType })),
    };
}

/** Une pièce jointe, pour la télécharger. */
export async function readAttachment(folder: Folder, uid: number, index: number): Promise<{ filename: string; contentType: string; content: Buffer } | null> {
    const { parsed } = await fetchParsed(folder, uid, false);
    const a = parsed.attachments[index];
    return a ? { filename: a.filename ?? 'piece-jointe', contentType: a.contentType || 'application/octet-stream', content: a.content } : null;
}

/** Lu / non lu, suivi : posé ou retiré. */
export async function setFlag(folder: Folder, uids: number[], flag: 'seen' | 'flagged', value: boolean): Promise<void> {
    if (!uids.length) return;
    const name = flag === 'seen' ? '\\Seen' : '\\Flagged';
    await inFolder(folder, async (client) => {
        if (value) await client.messageFlagsAdd(uids.join(','), [name], { uid: true });
        else await client.messageFlagsRemove(uids.join(','), [name], { uid: true });
    });
}

/** Met des messages à la corbeille (rien n'est supprimé définitivement). */
export async function trashMails(folder: Folder, uids: number[]): Promise<void> {
    if (!uids.length) return;
    await withImap(async (client) => {
        const path = await folderPath(client, folder);
        const trash = await folderPath(client, 'trash');
        if (!path || !trash) throw new Error('Dossier introuvable sur le serveur de messagerie.');
        if (path === trash) throw new Error('Ces messages sont déjà dans la corbeille.');
        const lock = await client.getMailboxLock(path);
        try {
            await client.messageMove(uids.join(','), trash, { uid: true });
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
    to: string[];
    cc: string[];
    subject: string;
    text: string;
    files: Array<{ filename: string; contentType: string; content: Buffer }>;
    inReplyTo?: string;
    references?: string[];
    /** Le message auquel on répond : marqué « répondu ». */
    answered?: { folder: Folder; uid: number };
}

/** Envoie depuis la boîte, garde la copie dans « Envoyés », marque l'original comme répondu. */
export async function sendFromMailbox(mail: Outgoing): Promise<void> {
    const c = connection();
    const { createTransport } = await import('nodemailer');
    const smtpPort = Number(process.env.SMTP_PORT?.trim() || 465);
    const message = {
        from: process.env.LOOMINA_MAIL_FROM?.trim() || `Loomina <${c.user}>`,
        to: mail.to,
        ...(mail.cc.length ? { cc: mail.cc } : {}),
        subject: mail.subject.slice(0, 250),
        text: mail.text,
        attachments: mail.files.map((f) => ({ filename: f.filename, contentType: f.contentType, content: f.content })),
        ...(mail.inReplyTo ? { inReplyTo: mail.inReplyTo, references: [...(mail.references ?? []), mail.inReplyTo] } : {}),
    };
    const transporter = createTransport({
        host: process.env.SMTP_HOST?.trim() || 'epinoche.o2switch.net',
        port: smtpPort,
        secure: smtpPort === 465,
        auth: { user: c.user, pass: c.pass },
        connectionTimeout: 15_000,
        greetingTimeout: 15_000,
        socketTimeout: 60_000,
    });
    const info = await transporter.sendMail(message);

    const raw = await new Promise<Buffer>((resolve, reject) =>
        createTransport({ streamTransport: true, buffer: true }).sendMail({ ...message, messageId: info.messageId, date: new Date() }, (err, r) => (err ? reject(err) : resolve(r.message as Buffer)))
    ).catch(() => null);
    if (raw) await saveToSent(raw);

    if (mail.answered) await setFlag(mail.answered.folder, [mail.answered.uid], 'seen', true).then(() => inFolder(mail.answered!.folder, (client) => client.messageFlagsAdd(String(mail.answered!.uid), ['\\Answered'], { uid: true }))).catch(() => {});
}
