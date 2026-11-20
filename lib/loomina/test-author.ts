/**
 * Espace auteur de test, ouvert à tous (demandes de Solal, 20/11/2026).
 *
 * Le numéro 06 12 34 56 78 ouvre l'espace auteur sans code SMS, comme un
 * tout nouvel auteur au premier jour : l'accueil en trois écrans, Mémo tout
 * petit, aucun appel, aucun récit. À chaque connexion, tout repart de zéro.
 *
 * Ce numéro ne correspond à aucun profil : les routes /api/user/* répondent
 * ici, sans jamais lire ni écrire Supabase. Ce que le visiteur règle pendant
 * sa visite (tu ou vous, sujets, proches) est gardé dans un cookie de son
 * navigateur seulement, pour que l'espace reste cohérent ; rien n'arrive chez
 * Loomina, et le visiteur suivant ne voit rien de ses essais.
 *
 * Les appels ne changent pas : sans profil, le serveur vocal ne trouve ni
 * livre ni rendez-vous pour ce numéro, et aucun SMS n'y est jamais envoyé.
 */

import { NextRequest, NextResponse } from 'next/server';
import { formatToE164 } from '@/lib/phone';
import { readSession } from './session';
import { DEMO_DATA } from './demo';
import { PHASE_LABELS } from './phases';
import { normalizeSchedule, describeSchedule } from './schedule';
import type { CallSchedule } from './schedule';
import { normalizeCallMinutes } from './call-length';
import { readPhaseState } from './phase-plan';
import { buildWeave } from './weave';

export const TEST_AUTHOR_PHONE = '+33612345678';

export function isTestAuthorPhone(phone: string | null | undefined): boolean {
    return Boolean(phone) && formatToE164(String(phone)) === TEST_AUTHOR_PHONE;
}

/** Vrai quand la requête vient de la session de test. */
export async function isTestSession(request: NextRequest): Promise<boolean> {
    const session = await readSession(request);
    return isTestAuthorPhone(session?.phone);
}

/** Démo locale (livre d'exemple de Jeanne) : seulement sous `next dev`. */
export function isLocalDemo(): boolean {
    return DEMO_DATA;
}

// ---------------------------------------------------------------------------
// La visite, gardée dans le navigateur du visiteur seulement.

export const ESSAI_COOKIE = 'loomina_essai';

type Prefs = {
    title: string | null;
    politeness: 'tu' | 'vous';
    firstNamePhonetic: string | null;
    writingStyle: string | null;
    sensitiveTopics: string[];
    smsChapter: boolean;
    callSchedule: CallSchedule;
    callMinutes: number;
    giverFirstName: string | null;
    shareWithGiver: boolean;
};

type Essai = {
    welcomeDone: boolean;
    prefs: Prefs;
    questions: string[];
    family: { name: string; relation: string }[];
};

function freshEssai(): Essai {
    return {
        welcomeDone: false,
        prefs: {
            title: null,
            politeness: 'vous',
            firstNamePhonetic: null,
            writingStyle: null,
            sensitiveTopics: [],
            smsChapter: true,
            callSchedule: normalizeSchedule(undefined),
            callMinutes: normalizeCallMinutes(undefined),
            giverFirstName: null,
            shareWithGiver: false,
        },
        questions: [],
        family: [],
    };
}

const str = (v: unknown, max: number): string | null => (typeof v === 'string' && v.trim() ? v.trim().slice(0, max) : null);

function readEssai(request: NextRequest): Essai {
    const base = freshEssai();
    const raw = request.cookies.get(ESSAI_COOKIE)?.value;
    if (!raw) return base;
    try {
        const v = JSON.parse(Buffer.from(raw, 'base64url').toString('utf8')) as Partial<Essai>;
        return applyPrefs(
            {
                welcomeDone: v.welcomeDone === true,
                prefs: base.prefs,
                questions: Array.isArray(v.questions) ? v.questions.map((q) => str(q, 200)).filter((q): q is string => Boolean(q)).slice(0, 6) : [],
                family: Array.isArray(v.family)
                    ? v.family
                          .map((f) => ({ name: str(f?.name, 60) ?? '', relation: str(f?.relation, 80) ?? '' }))
                          .filter((f) => f.name && f.relation)
                          .slice(0, 6)
                    : [],
            },
            (v.prefs ?? {}) as Record<string, unknown>,
        );
    } catch {
        return base;
    }
}

function applyPrefs(essai: Essai, body: Record<string, unknown>): Essai {
    const p = { ...essai.prefs };
    if (body.title !== undefined) p.title = str(body.title, 120);
    if (body.politeness === 'tu' || body.politeness === 'vous') p.politeness = body.politeness;
    if (body.firstNamePhonetic !== undefined) p.firstNamePhonetic = str(body.firstNamePhonetic, 80);
    if (body.writingStyle !== undefined) p.writingStyle = str(body.writingStyle, 200);
    if (Array.isArray(body.sensitiveTopics)) p.sensitiveTopics = body.sensitiveTopics.map((t) => str(t, 80)).filter((t): t is string => Boolean(t)).slice(0, 6);
    if (typeof body.smsChapter === 'boolean') p.smsChapter = body.smsChapter;
    if (typeof body.shareWithGiver === 'boolean') p.shareWithGiver = body.shareWithGiver;
    if (body.callSchedule !== undefined) p.callSchedule = normalizeSchedule(body.callSchedule);
    if (body.callMinutes !== undefined) p.callMinutes = normalizeCallMinutes(body.callMinutes);
    return { ...essai, prefs: p };
}

function withEssai(res: NextResponse, essai: Essai): NextResponse {
    res.cookies.set(ESSAI_COOKIE, Buffer.from(JSON.stringify(essai), 'utf8').toString('base64url'), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24,
    });
    return res;
}

/** À la connexion : la visite repart de zéro, comme pour un nouvel auteur. */
export function resetEssai(res: NextResponse): NextResponse {
    res.cookies.set(ESSAI_COOKIE, '', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 0 });
    return res;
}

const personTopic = (name: string, relation: string) => `Parler de ${name} (${relation}) : qui est cette personne, et quels souvenirs vous lient ?`;

function overview(essai: Essai) {
    const phase = 1 as const;
    const { prefs } = essai;
    return {
        firstName: null,
        essai: true,
        prefs,
        welcome: essai.welcomeDone ? null : { politeness: true, topics: true },
        shipping: null,
        project: {
            phase,
            phaseLabel: PHASE_LABELS[phase],
            progress: 0,
            completed: false,
            nextTopic: null,
            scheduleText: describeSchedule(prefs.callSchedule),
            chapters: 0,
            words: 0,
            weave: buildWeave({
                phase,
                completed: false,
                state: readPhaseState({}, phase),
                calls: 0,
                words: 0,
                photos: 0,
                hasTitle: Boolean(prefs.title),
                hasSchedule: prefs.callSchedule.active,
            }),
            timeline: [],
            family: essai.family,
            themes: [],
            openQuestions: essai.questions,
            calls: [],
        },
    };
}

export type TestRoute =
    | 'overview'
    | 'stories'
    | 'book'
    | 'book-compose'
    | 'book-pdf'
    | 'book-plan'
    | 'book-plan-compose'
    | 'preferences'
    | 'question'
    | 'person'
    | 'address'
    | 'chapter'
    | 'photos'
    | 'photo-upload';

const NOT_YET = 'Votre livre n’est pas encore commencé : il s’écrit après le premier appel.';

/**
 * La réponse de l'espace de test pour cette route, ou null si la requête
 * ne vient pas de la session de test (la route continue alors normalement).
 * À appeler en tout premier, avant de lire le corps de la requête.
 */
export async function testAuthorReply(request: NextRequest, route: TestRoute): Promise<NextResponse | null> {
    if (!(await isTestSession(request))) return null;
    const essai = readEssai(request);
    const body = request.method === 'GET' ? {} : ((await request.json().catch(() => ({}))) as Record<string, unknown>);

    switch (route) {
        case 'overview':
            return NextResponse.json(overview(essai));
        case 'stories':
            return NextResponse.json([]);
        case 'book':
            return NextResponse.json({ edition: null, running: null, failed: false, sourceCount: 0 });
        case 'book-plan':
            return NextResponse.json({ plan: null });
        case 'book-pdf':
            return NextResponse.json({ error: 'Votre livre n’est pas encore composé.' }, { status: 404 });
        case 'book-compose':
        case 'book-plan-compose':
            return NextResponse.json({ error: NOT_YET }, { status: 409 });
        case 'chapter':
            return NextResponse.json({ error: 'Chapitre inconnu' }, { status: 404 });
        case 'photos':
            return NextResponse.json({ photos: [] });
        case 'photo-upload':
            return NextResponse.json({ error: 'Les photos ne s’envoient pas depuis l’espace de test.' }, { status: 501 });
        case 'address':
            return NextResponse.json({ saved: true });
        case 'preferences': {
            const next = applyPrefs({ ...essai, welcomeDone: essai.welcomeDone || body.welcomeDone === true }, body);
            return withEssai(NextResponse.json({ saved: true }), next);
        }
        case 'question': {
            const q = str(body.question, 200);
            if (!q || q.length < 5) return NextResponse.json({ error: 'Question trop courte' }, { status: 400 });
            const next = { ...essai, questions: [q, ...essai.questions.filter((x) => x !== q)].slice(0, 6) };
            return withEssai(NextResponse.json({ openQuestions: next.questions }), next);
        }
        case 'person': {
            const name = str(body.name, 60);
            const relation = str(body.relation, 80);
            if (!name || name.length < 2) return NextResponse.json({ error: 'Indiquez un prénom.' }, { status: 400 });
            if (!relation || relation.length < 2) return NextResponse.json({ error: 'Indiquez qui est cette personne pour vous.' }, { status: 400 });
            if (essai.family.some((f) => f.name.toLowerCase() === name.toLowerCase())) {
                return NextResponse.json({ error: `${name} est déjà dans la liste.` }, { status: 409 });
            }
            const next = {
                ...essai,
                family: [{ name, relation }, ...essai.family].slice(0, 6),
                questions: [...essai.questions, personTopic(name, relation)].slice(0, 6),
            };
            return withEssai(NextResponse.json({ family: next.family, openQuestions: next.questions }), next);
        }
    }
}
