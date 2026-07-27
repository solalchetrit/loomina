/**
 * Accès Supabase côté serveur, et types du domaine.
 *
 * Toujours la service role key : ce code tourne exclusivement dans des
 * routes serveur, jamais dans le navigateur. Sans elle, RLS bloque la
 * lecture des profils — c'est exactement ce qui faisait échouer
 * `/api/call` avec « Client profil not found ».
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Phase } from './phases';

let cached: SupabaseClient | null = null;

export function db(): SupabaseClient {
    if (cached) return cached;

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url) throw new Error('NEXT_PUBLIC_SUPABASE_URL manquante');
    if (!key) {
        // Message explicite : c'est LA variable qui manquait en production
        // et qui faisait échouer les appels en silence.
        throw new Error(
            'SUPABASE_SERVICE_ROLE_KEY manquante. ' +
            'À ajouter dans les variables d\'environnement Vercel — ' +
            'la clé anon ne suffit pas, RLS bloque la lecture des profils.'
        );
    }

    cached = createClient(url, key, {
        auth: { persistSession: false, autoRefreshToken: false },
    });
    return cached;
}

// ------------------------------------------------------------
// Types du domaine
// ------------------------------------------------------------

export interface Profile {
    id: string;
    first_name: string | null;
    last_name: string | null;
    full_name: string | null;
    email: string | null;
    phone_number: string | null;
    politeness_preference: string | null;
    writing_style: string | null;
    sensitive_topics: string | null;
}

export interface Project {
    id: string;
    user_id: string;
    title: string | null;
    status: string;
    phase: Phase;
    phase_progress: number | null;
    current_topic_id: number | null;
    context: Record<string, unknown>;
    next_question_strategy: string | null;
    project_metadata: Record<string, unknown> | null;
    /** @deprecated conservée en lecture pendant la transition */
    global_context: string | null;
}

export interface SystemPrompt {
    phase: Phase;
    phase_key: string;
    prompt_content: string;
    first_message_template: string | null;
    version: number;
}

export interface ChapterSummary {
    chapter_number: number;
    title: string | null;
    content_markdown: string | null;
}

// ------------------------------------------------------------
// Recherche du client
// ------------------------------------------------------------

/**
 * Retrouve un profil à partir du numéro appelant.
 *
 * Vapi transmet le numéro en E.164 (`+33781311298`), mais les profils
 * ont pu être saisis dans d'autres formats. On tente donc plusieurs
 * variantes plutôt que d'échouer sur un espace ou un zéro initial.
 */
export async function findProfileByPhone(phone: string): Promise<Profile | null> {
    const variants = phoneVariants(phone);
    if (variants.length === 0) return null;

    const { data, error } = await db()
        .from('profiles')
        .select('*')
        .in('phone_number', variants)
        .limit(1);

    if (error) throw new Error(`Lecture profiles impossible : ${error.message}`);
    return (data?.[0] as Profile) ?? null;
}

export function phoneVariants(phone: string): string[] {
    const raw = (phone ?? '').trim();
    if (!raw) return [];

    const digits = raw.replace(/\D/g, '');
    const set = new Set<string>([raw]);

    if (digits) {
        set.add(digits);
        set.add(`+${digits}`);
        // +33781311298 → 0781311298
        if (digits.startsWith('33') && digits.length === 11) {
            set.add(`0${digits.slice(2)}`);
        }
        // 0781311298 → +33781311298
        if (digits.startsWith('0') && digits.length === 10) {
            set.add(`+33${digits.slice(1)}`);
            set.add(`33${digits.slice(1)}`);
        }
    }

    return [...set];
}

export async function findActiveProject(userId: string): Promise<Project | null> {
    const { data, error } = await db()
        .from('projects')
        .select('*')
        .eq('user_id', userId)
        .neq('status', 'completed')
        .limit(1);

    if (error) throw new Error(`Lecture projects impossible : ${error.message}`);
    return (data?.[0] as Project) ?? null;
}

export async function getSystemPrompt(phase: Phase): Promise<SystemPrompt | null> {
    const { data, error } = await db()
        .from('system_prompts')
        .select('phase, phase_key, prompt_content, first_message_template, version')
        .eq('phase', phase)
        .limit(1);

    if (error) throw new Error(`Lecture system_prompts impossible : ${error.message}`);
    return (data?.[0] as SystemPrompt) ?? null;
}

/**
 * Les N derniers chapitres écrits — ce que l'Écrivain n'a JAMAIS reçu
 * jusqu'ici, et qui explique les répétitions entre chapitres.
 */
export async function getRecentChapters(projectId: string, limit = 3): Promise<ChapterSummary[]> {
    const { data, error } = await db()
        .from('chapters')
        .select('chapter_number, title, content_markdown')
        .eq('project_id', projectId)
        .order('chapter_number', { ascending: false })
        .limit(limit);

    if (error) throw new Error(`Lecture chapters impossible : ${error.message}`);
    return ((data as ChapterSummary[]) ?? []).reverse();
}

export async function getNextChapterNumber(projectId: string): Promise<number> {
    const { data, error } = await db()
        .from('chapters')
        .select('chapter_number')
        .eq('project_id', projectId)
        .order('chapter_number', { ascending: false })
        .limit(1);

    if (error) throw new Error(`Lecture chapters impossible : ${error.message}`);
    return ((data?.[0]?.chapter_number as number) ?? 0) + 1;
}
