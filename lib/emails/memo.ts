/**
 * Mémo dans les e-mails (demande de Solal, 25/11/2026 : « Mémo et la
 * gamification, facile pour comprendre où on en est »).
 *
 * Mêmes cinq âges que dans l'espace auteur (lib/loomina/memo.ts) : un par
 * étape du livre, le dernier quand le récit est complet. Les images sont les
 * poses de public/memo, en PNG dans public/email (le WebP ne passe pas partout).
 */
import type { Phase } from '../loomina/phases';

export type MemoAge = 1 | 2 | 3 | 4 | 5;

/**
 * Les poses : a assis, b yeux fermés, c saute de joie, d occupé (dort à 1 an,
 * écrit, lit), e merci, f un souvenir, g salue, h écoute.
 */
export type MemoPose = 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h';

/** Les cinq étapes, avec leur nom court pour la frise des e-mails. */
export const MEMO_STEPS: { age: MemoAge; court: string; etape: string }[] = [
    { age: 1, court: 'Faire connaissance', etape: 'faire connaissance' },
    { age: 2, court: 'Les racines', etape: 'vos racines' },
    { age: 3, court: 'La vie adulte', etape: 'votre vie adulte' },
    { age: 4, court: 'Transmettre', etape: 'ce que vous transmettez' },
    { age: 5, court: 'Le livre', etape: 'votre livre' },
];

/** L'âge de Mémo pour un livre : sa phase, ou 5 quand le récit est complet. */
export function memoAge(phase: Phase | number | null | undefined, completed = false): MemoAge {
    if (completed) return 5;
    const n = Number(phase);
    return (n >= 1 && n <= 4 ? n : 1) as MemoAge;
}
