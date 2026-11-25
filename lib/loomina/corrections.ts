/**
 * Les remarques de l'auteur sur un récit, appliquées par l'IA.
 *
 * Deux façons de corriger (demande de Solal, 17/11/2026) :
 *  - l'auteur réécrit le texte lui-même : enregistré et affiché tout de suite
 *    (PATCH /api/user/chapters/[number]) ;
 *  - l'auteur écrit une remarque (« ma grand-mère s'appelait Rose, pas Rosa ») :
 *    elle est mise en attente ici, l'IA l'applique environ cinq minutes plus
 *    tard, puis l'auteur est prévenu que sa modification a été apportée.
 *
 * Les remarques en attente vivent dans
 * `projects.project_metadata.pending_corrections`. Elles sont traitées par
 * /api/jobs/process, que le serveur vocal appelle toutes les 5 minutes.
 */

import { db } from './db';
import { correctionEmail } from '../emails/messages/ecriture';
import { memoAge } from '../emails/memo';
import type { Profile, Project } from './db';
import { normalizeContext } from './context';
import { applyCorrection, countWords } from './writer';
import { carryIntoBook } from './book-edition';
import { sendEmail, alertTeam, teamContacts } from './notify';
import { sendSms } from './sms';
import { SITE } from '../../config/site';

export interface PendingCorrection {
    id: string;
    chapter: number;
    text: string;
    at: string;
    attempts?: number;
}

/** Délai avant d'appliquer une remarque : l'auteur peut encore en ajouter d'autres. */
const WAIT_MS = 4 * 60 * 1000;
const MAX_TRIES = 3;
const MAX_PENDING = 20;

export function readPending(meta: Record<string, unknown> | null | undefined): PendingCorrection[] {
    const raw = meta?.pending_corrections;
    if (!Array.isArray(raw)) return [];
    return raw.filter((c): c is PendingCorrection => !!c && typeof c === 'object' && typeof (c as PendingCorrection).text === 'string' && Number.isInteger((c as PendingCorrection).chapter));
}

async function writePending(projectId: string, change: (list: PendingCorrection[]) => PendingCorrection[]): Promise<void> {
    // Relu juste avant d'écrire : les réglages du livre changent ailleurs aussi.
    const { data, error } = await db().from('projects').select('project_metadata').eq('id', projectId).single();
    if (error) throw new Error(`Lecture du livre impossible : ${error.message}`);
    const meta = (data?.project_metadata ?? {}) as Record<string, unknown>;
    const next = change(readPending(meta));
    const { error: writeErr } = await db()
        .from('projects')
        .update({ project_metadata: { ...meta, pending_corrections: next.length ? next : null } })
        .eq('id', projectId);
    if (writeErr) throw new Error(`Écriture des remarques impossible : ${writeErr.message}`);
}

/** L'auteur vient d'écrire une remarque : elle attend son tour. */
export async function queueCorrection(projectId: string, chapter: number, text: string): Promise<void> {
    const entry: PendingCorrection = { id: crypto.randomUUID(), chapter, text: text.slice(0, 300), at: new Date().toISOString() };
    await writePending(projectId, (list) => [...list, entry].slice(-MAX_PENDING));
}

function doneTexts(profile: Pick<Profile, 'first_name' | 'politeness_preference'>, title: string, phase: number | null): { subject: string; email: string; html: string; sms: string } {
    const tu = profile.politeness_preference === 'tu';
    const host = SITE.url.replace(/^https?:\/\/(www\.)?/, '');
    // L'e-mail : lib/emails/messages/ecriture.ts.
    const mail = correctionEmail({ firstName: profile.first_name, tu, title, age: memoAge(phase) });
    return {
        subject: mail.subject,
        email: mail.text,
        html: mail.html,
        sms: tu
            ? `Loomina : ta remarque sur « ${title} » a été prise en compte, le récit est corrigé ! À relire sur ${host}/dashboard`
            : `Loomina : votre remarque sur « ${title} » a été prise en compte, le récit est corrigé ! À relire sur ${host}/dashboard`,
    };
}

/** Applique UNE remarque : corrige le récit, la mémoire du livre et le livre composé, puis prévient l'auteur. */
async function applyOne(project: Project, profile: Profile, c: PendingCorrection): Promise<void> {
    const { data: rows, error } = await db()
        .from('chapters')
        .select('id, version, title, content_markdown')
        .eq('project_id', project.id)
        .eq('chapter_number', c.chapter)
        .neq('status', 'archived')
        .limit(1);
    if (error) throw new Error(error.message);
    const chapter = rows?.[0];
    const before = ((chapter?.content_markdown as string | null) ?? '').trim();
    if (!chapter || !before) throw new Error(`récit ${c.chapter} introuvable`);

    const context = normalizeContext(project.context);
    const after = (await applyCorrection({ content: before, correction: c.text, context })).trim();
    if (!after) throw new Error('texte corrigé vide');

    if (after !== before) {
        const { error: saveErr } = await db()
            .from('chapters')
            .update({ content_markdown: after, word_count: countWords(after), version: ((chapter.version as number) ?? 1) + 1, updated_at: new Date().toISOString() })
            .eq('id', chapter.id);
        if (saveErr) throw new Error(saveErr.message);
    }

    // La remarque rejoint la mémoire du livre : les récits suivants la respectent.
    const { data: fresh } = await db().from('projects').select('context').eq('id', project.id).single();
    const latest = normalizeContext(fresh?.context ?? project.context);
    const next = normalizeContext({ ...latest, author_corrections: [...(latest.author_corrections ?? []), `Chapitre ${c.chapter} : ${c.text}`] });
    await db().from('projects').update({ context: next }).eq('id', project.id);

    if (after !== before) await carryIntoBook({ projectId: project.id, source: c.chapter, before, after, correction: c.text, origin: SITE.url }).catch((err) => console.warn('[remarque] report dans le livre :', err instanceof Error ? err.message : err));

    // Prévenir l'auteur : e-mail si l'adresse du compte est la sienne (pas celle
    // de la personne qui a offert le livre), SMS sinon ou si l'e-mail ne part pas.
    const texts = doneTexts(profile, (chapter.title as string | null) ?? `Récit ${c.chapter}`, project.phase);
    const ownEmail = project.project_metadata?.is_gift === true ? null : profile.email;
    const mailed = ownEmail ? await sendEmail({ to: ownEmail, subject: texts.subject, text: texts.email, html: texts.html, replyTo: teamContacts().email, loginPhone: profile.phone_number }) : false;
    if (!mailed && profile.phone_number) await sendSms(profile.phone_number, texts.sms);
}

/** Traite les remarques arrivées à échéance. Appelé toutes les 5 minutes. Ne lève pas. */
export async function sweepCorrections(limit = 5): Promise<{ applied: number; failed: number }> {
    const out = { applied: 0, failed: 0 };
    try {
        const { data, error } = await db().from('projects').select('*').not('project_metadata->pending_corrections', 'is', null).limit(50);
        if (error) throw new Error(error.message);
        for (const project of (data ?? []) as Project[]) {
            const due = readPending(project.project_metadata).filter((c) => Date.now() - Date.parse(c.at) >= WAIT_MS);
            if (!due.length) continue;
            const { data: profile } = await db().from('profiles').select('*').eq('id', project.user_id).maybeSingle();
            if (!profile) continue;
            for (const c of due) {
                if (out.applied + out.failed >= limit) return out;
                try {
                    await applyOne(project, profile as Profile, c);
                    await writePending(project.id, (list) => list.filter((x) => x.id !== c.id));
                    out.applied += 1;
                } catch (err) {
                    out.failed += 1;
                    const message = err instanceof Error ? err.message : String(err);
                    const tries = (c.attempts ?? 0) + 1;
                    console.warn(`[remarque] échec (essai ${tries}) :`, message);
                    if (tries >= MAX_TRIES) {
                        await writePending(project.id, (list) => list.filter((x) => x.id !== c.id));
                        await alertTeam({
                            subject: 'Une remarque d’auteur n’a pas pu être appliquée',
                            text: `Récit ${c.chapter} de ${(profile as Profile).first_name ?? 'un auteur'}.\nRemarque : « ${c.text} »\nErreur : ${message}\n\nÀ corriger à la main.`,
                            sms: `la remarque d'un auteur n'a pas pu être appliquée (récit ${c.chapter}). Voir e-mail.`,
                        });
                    } else {
                        await writePending(project.id, (list) => list.map((x) => (x.id === c.id ? { ...x, attempts: tries } : x)));
                    }
                }
            }
        }
    } catch (err) {
        console.error('[remarque] passage impossible :', err instanceof Error ? err.message : String(err));
    }
    return out;
}
