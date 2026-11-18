"use server";

/**
 * Les actions du webmail de l'admin, appelées depuis l'écran (comme sur
 * L'Étincelle). Chacune vérifie d'abord la session de l'admin.
 */

import { isAdmin } from "@/lib/admin/auth";
import { isFolder, listMails, readMail, searchMails, sendFromMailbox, setFlag, trashMails, type Folder, type MailFull, type MailList } from "@/lib/admin/mailbox";

type Ok<T> = ({ ok: true } & T) | { ok: false; error: string };

async function guard<T>(fn: () => Promise<T>): Promise<Ok<T>> {
  if (!(await isAdmin())) return { ok: false, error: "Session expirée : reconnectez-vous à l’admin." };
  try {
    return { ok: true, ...(await fn()) } as Ok<T>;
  } catch (err) {
    console.error("[admin/mails]", err);
    return { ok: false, error: err instanceof Error ? err.message : "Erreur inattendue." };
  }
}

const folderOf = (f: string): Folder => (isFolder(f) ? f : "inbox");
const uidsOf = (u: number[]) => u.filter((x) => Number.isInteger(x) && x > 0).slice(0, 500);

export async function lireMail(folder: string, uid: number): Promise<Ok<{ mail: MailFull }>> {
  return guard(async () => ({ mail: await readMail(folderOf(folder), uid) }));
}

export async function plusDeMails(folder: string, offset: number): Promise<Ok<{ liste: MailList }>> {
  return guard(async () => ({ liste: await listMails(folderOf(folder), Math.max(0, offset)) }));
}

export async function chercher(folder: string, q: string): Promise<Ok<{ liste: MailList }>> {
  return guard(async () => ({ liste: await searchMails(folderOf(folder), q.trim().slice(0, 100)) }));
}

export async function marquer(folder: string, uids: number[], flag: "seen" | "flagged", value: boolean): Promise<Ok<object>> {
  return guard(async () => {
    await setFlag(folderOf(folder), uidsOf(uids), flag, value);
    return {};
  });
}

export async function corbeille(folder: string, uids: number[]): Promise<Ok<object>> {
  return guard(async () => {
    await trashMails(folderOf(folder), uidsOf(uids));
    return {};
  });
}

export interface Envoi {
  to: string;
  cc: string;
  subject: string;
  text: string;
  inReplyTo?: string;
  references?: string[];
  answered?: { folder: string; uid: number };
  files: Array<{ filename: string; contentType: string; base64: string }>;
}

const emails = (s: string) => s.split(/[,;\s]+/).map((x) => x.trim()).filter(Boolean);
const valid = (e: string) => /^[^\s@,;<>]+@[^\s@,;<>]+\.[^\s@,;<>]{2,}$/.test(e);

export async function envoyer(e: Envoi): Promise<Ok<object>> {
  return guard(async () => {
    const to = emails(e.to);
    const cc = emails(e.cc);
    const bad = [...to, ...cc].find((x) => !valid(x));
    if (!to.length) throw new Error("Indiquez au moins un destinataire.");
    if (bad) throw new Error(`Adresse invalide : ${bad}`);
    if (!e.subject.trim()) throw new Error("Il manque l’objet.");
    if (!e.text.trim()) throw new Error("Le message est vide.");
    const files = (e.files ?? []).slice(0, 10).map((f) => ({ filename: f.filename.slice(0, 200), contentType: f.contentType || "application/octet-stream", content: Buffer.from(f.base64, "base64") }));
    if (files.reduce((s, f) => s + f.content.length, 0) > 15 * 1024 * 1024) throw new Error("Pièces jointes trop lourdes (15 Mo au total).");
    await sendFromMailbox({
      to,
      cc,
      subject: e.subject.trim(),
      text: e.text,
      files,
      inReplyTo: e.inReplyTo,
      references: e.references,
      answered: e.answered && isFolder(e.answered.folder) ? { folder: e.answered.folder, uid: e.answered.uid } : undefined,
    });
    return {};
  });
}
