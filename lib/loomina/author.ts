/**
 * L'auteur connecté, vu depuis les routes de l'espace auteur.
 *
 * Toutes ces routes partent du cookie de session (jamais d'un identifiant
 * envoyé par le navigateur) et lisent avec la clé service role.
 */

import { NextRequest, NextResponse } from 'next/server';
import { findProfileByPhone, findActiveProject } from './db';
import type { Profile, Project } from './db';
import { readSession } from './session';
import { isTestAuthorPhone } from './test-author';

export type Author = { profile: Profile; project: Project | null };

/** L'auteur, ou la réponse HTTP à renvoyer telle quelle (401 ou 404). */
export async function currentAuthor(request: NextRequest): Promise<Author | NextResponse> {
    const session = await readSession(request);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // Garde-fou : la session de test (01 12 34 56 78) ne lit ni n'écrit jamais un vrai livre,
    // même si un profil portait un jour ce numéro.
    if (isTestAuthorPhone(session.phone)) return NextResponse.json({ error: 'Espace de test : rien n’est enregistré.' }, { status: 403 });

    const profile = await findProfileByPhone(session.phone);
    if (!profile) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    return { profile, project: await findActiveProject(profile.id) };
}

/** Sujets sensibles : une ligne séparée par des virgules, comme l'écrit le pipeline (lib/loomina/pipeline.ts). */
export function splitTopics(raw: string | null): string[] {
    return (raw ?? '')
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);
}
