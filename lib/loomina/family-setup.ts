/**
 * La personne qui a offert le livre peut préparer le premier appel du
 * narrateur (prénom, tu/vous, sujets à éviter) : seulement avant tout appel,
 * et tant que le narrateur n'a rien réglé lui-même (demande de Solal du
 * 20/11/2026). Une fois l'appel passé, ces réglages sont à lui seul.
 */
export function familySetupOpen({ meta, status, calls }: { meta: Record<string, unknown> | null | undefined; status: string | null | undefined; calls: number }): boolean {
    if (status === 'completed' || calls > 0) return false;
    const m = meta ?? {};
    // Déjà réglé par le narrateur : on ne touche plus à ses choix.
    if (m.prefs_set_at && m.prefs_set_by !== 'giver') return false;
    return true;
}
