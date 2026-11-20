/**
 * Espace auteur de test, ouvert à tous (demande de Solal, 20/11/2026).
 *
 * Le numéro 01 12 34 56 78 ouvre l'espace auteur sans code SMS. Il ne
 * correspond à aucun profil : toutes les routes /api/user/* répondent alors
 * avec le livre d'exemple de lib/loomina/demo.ts (Jeanne), sans jamais lire
 * ni écrire Supabase. Les essais (réglages, questions, proches) ne sont pas
 * gardés : chaque visiteur retrouve le même exemple.
 *
 * Les appels ne changent pas : ce numéro n'a pas de profil, le serveur vocal
 * ne lui trouve donc ni livre ni rendez-vous.
 */

import type { NextRequest } from 'next/server';
import { formatToE164 } from '@/lib/phone';
import { readSession } from './session';
import { DEMO_DATA } from './demo';

export const TEST_AUTHOR_PHONE = '+33112345678';

export function isTestAuthorPhone(phone: string | null | undefined): boolean {
    return Boolean(phone) && formatToE164(String(phone)) === TEST_AUTHOR_PHONE;
}

/** Vrai quand la requête doit recevoir le livre d'exemple : démo locale, ou session du numéro de test. */
export async function isDemoRequest(request: NextRequest): Promise<boolean> {
    if (DEMO_DATA) return true;
    const session = await readSession(request);
    return isTestAuthorPhone(session?.phone);
}
