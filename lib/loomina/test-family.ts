/**
 * Espace famille de test, ouvert à tous (demande de Solal, 20/11/2026).
 *
 * Le numéro 07 12 34 56 78 ouvre l'espace famille sans code SMS, comme une
 * personne qui vient d'offrir un livre : Claire a offert le livre à sa mère,
 * Jeanne, qui n'a pas encore appelé. Elle voit l'accueil de l'espace famille
 * et peut préparer le premier appel. À chaque connexion, tout repart de zéro.
 *
 * Même principe que l'espace auteur de test (test-author.ts) : aucun profil
 * ni livre ne porte ce numéro, les routes /api/famille/* répondent ici sans
 * jamais lire ni écrire Supabase. Ce que le visiteur règle reste dans un
 * cookie de son navigateur pendant sa visite ; rien n'arrive chez Loomina.
 */

import { NextRequest, NextResponse } from 'next/server';
import { formatToE164 } from '@/lib/phone';
import { readSession } from './session';
import { PHASE_LABELS } from './phases';
import { normalizeSchedule, describeSchedule } from './schedule';
import { readPhaseState } from './phase-plan';
import { buildWeave } from './weave';

export const TEST_FAMILY_PHONE = '+33712345678';
export const TEST_FAMILY_PROJECT = 'essai-famille';

export function isTestFamilyPhone(phone: string | null | undefined): boolean {
    return Boolean(phone) && formatToE164(String(phone)) === TEST_FAMILY_PHONE;
}

const COOKIE = 'loomina_essai_famille';

type Visite = {
    welcomeDone: boolean;
    setByGiver: boolean;
    setup: { firstName: string; firstNamePhonetic: string; politeness: 'tu' | 'vous'; sensitiveTopics: string[] };
    questions: string[];
};

const str = (v: unknown, max: number): string | null => (typeof v === 'string' && v.trim() ? v.trim().slice(0, max) : null);

function fresh(): Visite {
    return { welcomeDone: false, setByGiver: false, setup: { firstName: 'Jeanne', firstNamePhonetic: '', politeness: 'vous', sensitiveTopics: [] }, questions: [] };
}

function read(request: NextRequest): Visite {
    const base = fresh();
    const raw = request.cookies.get(COOKIE)?.value;
    if (!raw) return base;
    try {
        const v = JSON.parse(Buffer.from(raw, 'base64url').toString('utf8')) as Partial<Visite>;
        const s = (v.setup ?? {}) as Partial<Visite['setup']>;
        return {
            welcomeDone: v.welcomeDone === true,
            setByGiver: v.setByGiver === true,
            setup: {
                firstName: str(s.firstName, 60) ?? base.setup.firstName,
                firstNamePhonetic: str(s.firstNamePhonetic, 80) ?? '',
                politeness: s.politeness === 'tu' ? 'tu' : 'vous',
                sensitiveTopics: Array.isArray(s.sensitiveTopics) ? s.sensitiveTopics.map((t) => str(t, 80)).filter((t): t is string => Boolean(t)).slice(0, 6) : [],
            },
            questions: Array.isArray(v.questions) ? v.questions.map((q) => str(q, 200)).filter((q): q is string => Boolean(q)).slice(0, 6) : [],
        };
    } catch {
        return base;
    }
}

function keep(res: NextResponse, v: Visite): NextResponse {
    res.cookies.set(COOKIE, Buffer.from(JSON.stringify(v), 'utf8').toString('base64url'), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24,
    });
    return res;
}

/** À la connexion et à la déconnexion : la visite repart de zéro. */
export function resetFamilyVisit(res: NextResponse): NextResponse {
    res.cookies.set(COOKIE, '', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 0 });
    return res;
}

function overview(v: Visite) {
    const phase = 1 as const;
    const schedule = normalizeSchedule(undefined);
    return {
        essai: true,
        giverFirstName: 'Claire',
        books: [
            {
                id: TEST_FAMILY_PROJECT,
                narratorFirstName: v.setup.firstName,
                phase,
                weave: buildWeave({ phase, completed: false, state: readPhaseState({}, phase), calls: 0, words: 0, photos: 0, hasTitle: true, hasSchedule: false }),
                words: null,
                welcome: !v.welcomeDone,
                setup: v.setup,
                setBy: v.setByGiver ? 'giver' : null,
                title: `Biographie de ${v.setup.firstName}`,
                phaseLabel: PHASE_LABELS[phase],
                progress: 0,
                completed: false,
                delivery: { stage: 'writing', tracking: null },
                scheduleText: describeSchedule(schedule),
                shared: false,
                calls: [],
                chapters: [],
                openQuestions: v.questions,
            },
        ],
    };
}

/**
 * La réponse de l'espace famille de test, ou null si la requête ne vient pas
 * de la session de test. À appeler en tout premier, avant de lire le corps.
 */
export async function testFamilyReply(request: NextRequest, route: 'overview' | 'preferences' | 'questions'): Promise<NextResponse | null> {
    const session = await readSession(request);
    // L'espace auteur de test (06 12 34 56 78) n'a pas d'espace famille : sans lire la base.
    if (session && formatToE164(session.phone) === '+33612345678') return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (!isTestFamilyPhone(session?.phone)) return null;
    const v = read(request);
    if (route === 'overview') return NextResponse.json(overview(v));

    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    if (body.projectId !== TEST_FAMILY_PROJECT) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    if (route === 'preferences') {
        const next: Visite = { ...v, welcomeDone: true, setup: { ...v.setup } };
        const wantsSetup = body.politeness !== undefined || body.sensitiveTopics !== undefined || body.firstName !== undefined || body.firstNamePhonetic !== undefined;
        if (wantsSetup) {
            const firstName = str(body.firstName, 60);
            if (firstName) next.setup.firstName = firstName;
            if (body.firstNamePhonetic !== undefined) next.setup.firstNamePhonetic = str(body.firstNamePhonetic, 80) ?? '';
            if (body.politeness === 'tu' || body.politeness === 'vous') next.setup.politeness = body.politeness;
            if (Array.isArray(body.sensitiveTopics)) {
                next.setup.sensitiveTopics = body.sensitiveTopics.map((t) => str(t, 80)).filter((t): t is string => Boolean(t)).slice(0, 6);
            }
            if (body.politeness !== undefined || body.sensitiveTopics !== undefined) next.setByGiver = true;
        }
        return keep(NextResponse.json({ saved: true }), next);
    }

    const question = str(body.question, 200);
    if (!question || question.length < 5) return NextResponse.json({ error: 'Question trop courte' }, { status: 400 });
    const next = { ...v, questions: [...v.questions.filter((q) => q !== question), question].slice(-6) };
    return keep(NextResponse.json({ openQuestions: next.questions }), next);
}
