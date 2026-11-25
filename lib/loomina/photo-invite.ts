/**
 * Le lien d'invitation des proches (demande de Solal, 25/11/2026).
 *
 * L'auteur copie, depuis le module « Vos photos », un lien qu'il envoie à
 * ses proches. Celui qui l'ouvre ajoute des photos au livre sans compte ni
 * code SMS. Le lien ne montre rien du livre : ni récits, ni photos déjà
 * envoyées, seulement le prénom de l'auteur.
 *
 * Un jeton aléatoire par livre, gardé dans project_metadata.photo_invite,
 * créé au premier affichage puis fixe : chaque auteur a son adresse.
 */

import { randomBytes } from 'node:crypto';
import { db, findActiveProject } from './db';
import type { Profile, Project } from './db';
import { SITE } from '@/config/site';

/** Le jeton de la page d'essai (espace auteur de test) : rien ne s'enregistre. */
export const ESSAI_INVITE_TOKEN = 'essai';

export interface PhotoInvite {
    token: string;
    created_at: string;
}

export function readInvite(meta: Record<string, unknown> | null | undefined): PhotoInvite | null {
    const raw = meta?.photo_invite as Partial<PhotoInvite> | undefined;
    return raw && typeof raw.token === 'string' && raw.token.length >= 20 ? { token: raw.token, created_at: String(raw.created_at ?? '') } : null;
}

export function inviteUrl(token: string): string {
    return `${SITE.url}/photos/${token}`;
}

/**
 * Le lien du livre, créé s'il n'existe pas encore. Relit le livre juste
 * avant d'écrire, comme l'ajout d'une photo.
 */
export async function ensureInvite(projectId: string): Promise<PhotoInvite> {
    const { data, error } = await db().from('projects').select('project_metadata').eq('id', projectId).single();
    if (error) throw new Error(error.message);
    const meta = (data.project_metadata ?? {}) as Record<string, unknown>;
    const current = readInvite(meta);
    if (current) return current;
    const invite: PhotoInvite = { token: randomBytes(18).toString('base64url'), created_at: new Date().toISOString() };
    const { error: upErr } = await db().from('projects').update({ project_metadata: { ...meta, photo_invite: invite } }).eq('id', projectId);
    if (upErr) throw new Error(upErr.message);
    return invite;
}

/**
 * Le livre et son auteur derrière un jeton, ou null : jeton faux, livre
 * remboursé ou terminé.
 */
export async function findByInvite(token: string): Promise<{ project: Project; profile: Profile } | null> {
    if (!/^[A-Za-z0-9_-]{20,64}$/.test(token)) return null;
    const { data, error } = await db().from('projects').select('*').eq('project_metadata->photo_invite->>token', token).limit(1);
    if (error) throw new Error(error.message);
    const project = (data?.[0] ?? null) as Project | null;
    if (!project || readInvite(project.project_metadata)?.token !== token) return null;
    const { data: profile, error: pErr } = await db().from('profiles').select('*').eq('id', project.user_id).maybeSingle();
    if (pErr) throw new Error(pErr.message);
    if (!profile) return null;
    // Seul le livre en cours de l'auteur reçoit des photos (pas un livre remboursé ni un ancien).
    const active = await findActiveProject(profile.id);
    if (!active || active.id !== project.id || project.status === 'completed') return null;
    return { project, profile: profile as Profile };
}
