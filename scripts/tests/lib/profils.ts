/**
 * Profils de test dans la base.
 *
 * Reconnaissables à trois marqueurs : l'adresse `banc-…@banc.loomina.invalid`,
 * un numéro de la plage réservée aux fictions (+33 1 99 00 xx xx, jamais
 * attribuée), et `project_metadata.banc = true`. Les SMS « chapitre prêt »
 * sont coupés sur ces projets. Le nettoyage ne touche QUE ces profils.
 */

import './env';
import crypto from 'node:crypto';
import { db } from '../../../lib/loomina/db';
import type { Profile, Project } from '../../../lib/loomina/db';

export const TEST_EMAIL_DOMAIN = 'banc.loomina.invalid';

export interface Seed {
    slug: string;
    prenom: string;
    nom: string;
    tutoiement?: 'tu' | 'vous';
    /** Préférences déjà réglées sur l'espace auteur (le premier appel ne les redemande pas). */
    prefsReglees?: boolean;
    sujetsSensibles?: string | null;
    style?: string | null;
    phase?: 1 | 2 | 3 | 4;
    progression?: number;
    contexte?: Record<string, unknown>;
    questionSuivante?: string | null;
    livreOffert?: boolean;
    /** État de la phase : sujets déjà couverts, question « on passe à la suite ? » à poser. */
    etatPhase?: { covered: string[]; skipped?: string[]; check: 'to_ask' | 'wait' | null };
    /** Sujets propres à la personne déjà relevés. */
    sujets?: Array<{ id: number; phase: 2 | 3 | 4; label: string; status: 'open' | 'done' | 'skip' }>;
}

export interface TestAccount {
    profile: Profile;
    project: Project;
    phone: string;
}

/** Numéro fictif : plage ARCEP 01 99 00 xx xx, réservée aux œuvres de fiction. */
function fakePhone(): string {
    return `+3319900${String(crypto.randomInt(0, 10000)).padStart(4, '0')}`;
}

/** Un portable fictif (plage ARCEP 06 39 98 xx xx, réservée aux œuvres de fiction) : la démo y annonce le récit par SMS. */
export function unknownMobile(): string {
    return `+3363998${String(crypto.randomInt(0, 10000)).padStart(4, '0')}`;
}

/** Un numéro qui n'appartient à aucun profil (appelant inconnu). */
export function unknownPhone(): string {
    return `+3326191${String(crypto.randomInt(0, 10000)).padStart(4, '0')}`;
}

export async function createAccount(seed: Seed, runId: string): Promise<TestAccount> {
    const supabase = db();
    const email = `banc-${seed.slug}-${runId}@${TEST_EMAIL_DOMAIN}`;
    const { data: created, error } = await supabase.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: { first_name: seed.prenom, last_name: seed.nom, banc: true },
    });
    if (error || !created.user) throw new Error(`Création du compte de test impossible : ${error?.message}`);
    const id = created.user.id;

    let phone = fakePhone();
    for (let i = 0; i < 5; i++) {
        const { error: pErr } = await supabase.from('profiles').upsert({
            id,
            first_name: seed.prenom,
            last_name: seed.nom,
            full_name: `${seed.prenom} ${seed.nom}`,
            email,
            phone_number: phone,
            politeness_preference: seed.tutoiement ?? 'vous',
            writing_style: seed.style ?? 'Naturel',
            sensitive_topics: seed.sujetsSensibles ?? null,
        });
        if (!pErr) break;
        if (pErr.code !== '23505' || i === 4) throw new Error(`Écriture du profil de test impossible : ${pErr.message}`);
        phone = fakePhone();
    }

    const { data: project, error: prErr } = await supabase
        .from('projects')
        .insert({
            user_id: id,
            title: `Biographie de ${seed.prenom}`,
            status: 'active',
            phase: seed.phase ?? 1,
            phase_progress: seed.progression ?? 0,
            current_topic_id: 1,
            context: seed.contexte ?? {},
            next_question_strategy: seed.questionSuivante ?? null,
            project_metadata: {
                banc: true,
                sms_chapter: false,
                is_gift: seed.livreOffert === true,
                ...(seed.prefsReglees ? { prefs_set_at: new Date().toISOString() } : {}),
                ...(seed.etatPhase ? { phase_state: { phase: seed.phase ?? 1, skipped: [], ...seed.etatPhase } } : {}),
                ...(seed.sujets ? { book_topics: seed.sujets } : {}),
            },
        })
        .select('*')
        .single();
    if (prErr) throw new Error(`Écriture du projet de test impossible : ${prErr.message}`);

    const { data: profile } = await supabase.from('profiles').select('*').eq('id', id).single();
    return { profile: profile as Profile, project: project as Project, phone };
}

/** Tout ce que la base contient pour un projet, pour les contrôles et le rapport. */
export async function snapshot(account: TestAccount) {
    const supabase = db();
    const pid = account.project.id;
    const [profile, project, interviews, chapters, family, events] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', account.profile.id).single(),
        supabase.from('projects').select('*').eq('id', pid).single(),
        supabase.from('interviews').select('*').eq('project_id', pid).order('created_at', { ascending: true }),
        supabase.from('chapters').select('*').eq('project_id', pid).order('chapter_number', { ascending: true }),
        supabase.from('family_members').select('*').eq('project_id', pid).order('created_at', { ascending: true }),
        supabase.from('call_events').select('id, vapi_call_id, status, attempts, error, created_at, processed_at').eq('project_id', pid).order('created_at', { ascending: true }),
    ]);
    for (const r of [profile, project, interviews, chapters, family, events]) if (r.error) throw new Error(`Lecture de la base impossible : ${r.error.message}`);
    /* eslint-disable @typescript-eslint/no-explicit-any */
    return {
        profile: profile.data as Profile,
        project: project.data as Project & { updated_at: string },
        interviews: (interviews.data ?? []) as any[],
        chapters: (chapters.data ?? []) as any[],
        family: (family.data ?? []) as any[],
        events: (events.data ?? []) as any[],
    };
}
export type Snapshot = Awaited<ReturnType<typeof snapshot>>;

/** Supprime tous les profils de test (et seulement eux). Retourne leur nombre. */
export async function cleanup(): Promise<number> {
    const supabase = db();
    const { data: profiles, error } = await supabase.from('profiles').select('id, email').like('email', `banc-%@${TEST_EMAIL_DOMAIN}`);
    if (error) throw new Error(`Lecture des profils de test impossible : ${error.message}`);
    const ids = (profiles ?? []).map((p) => p.id as string);

    if (ids.length) {
        const { data: projects } = await supabase.from('projects').select('id, project_metadata').in('user_id', ids);
        const pids = (projects ?? []).map((p) => p.id as string);
        if (pids.length) {
            const steps = ['chapters', 'interviews', 'call_events', 'family_members'] as const;
            for (const table of steps) {
                const { error: dErr } = await supabase.from(table).delete().in('project_id', pids);
                if (dErr) throw new Error(`Nettoyage de ${table} impossible : ${dErr.message}`);
            }
            const { error: pErr } = await supabase.from('projects').delete().in('id', pids);
            if (pErr) throw new Error(`Nettoyage de projects impossible : ${pErr.message}`);
        }
        const { error: prErr } = await supabase.from('profiles').delete().in('id', ids);
        if (prErr) throw new Error(`Nettoyage de profiles impossible : ${prErr.message}`);
        for (const id of ids) await supabase.auth.admin.deleteUser(id);
    }
    // Événements d'appels simulés sans projet (profil introuvable, etc.).
    await supabase.from('call_events').delete().like('vapi_call_id', 'CAbanc%');
    return ids.length;
}
