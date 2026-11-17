/**
 * Les juges : un modèle relit ce que les règles mesurables ne voient pas
 * (qualité d'écoute, détails inventés, mémoire fausse, tenue du livre).
 * Chaque juge rend un JSON ; aucun n'écrit en base.
 */

import { track } from './env';
import OpenAI from 'openai';

export const JUDGE_MODEL = process.env.BANC_JUGE_MODEL ?? 'gpt-4.1';
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY, maxRetries: 2, timeout: 180_000 });

/* eslint-disable @typescript-eslint/no-explicit-any */
/** Le chapitre et le livre demandent un juge plus fin : gpt-4.1 prend les reformulations fidèles pour des inventions. */
export const FINE_JUDGE_MODEL = process.env.BANC_JUGE_FIN_MODEL ?? 'gpt-5.5';

async function judge(system: string, user: string, model = JUDGE_MODEL): Promise<any> {
    const res = await openai.chat.completions.create({
        model,
        ...(/^(gpt-5|o\d)/.test(model) ? { reasoning_effort: 'low' as const } : { temperature: 0 }),
        response_format: { type: 'json_object' },
        messages: [{ role: 'system', content: system }, { role: 'user', content: user }],
    });
    track(model, res.usage);
    try {
        return JSON.parse(res.choices[0]?.message?.content ?? '{}');
    } catch {
        return {};
    }
}
const list = (v: unknown): string[] => (Array.isArray(v) ? v.map((x) => (typeof x === 'string' ? x : JSON.stringify(x))) : []);
const num = (v: unknown, fallback = 0): number => (Number.isFinite(Number(v)) ? Number(v) : fallback);

export interface LiveVerdict {
    ecoute: number;
    relances: number;
    naturel: number;
    respect: number;
    problemes: Array<{ replique: number; type: string; detail: string }>;
    resume: string;
}

/** L'entretien en direct : Loomina a-t-elle bien mené l'appel ? */
export async function judgeLive(params: {
    numbered: string;
    memory: string;
    tutoiement: string;
    sensibles: string;
    suggestions: string[];
    premierAppel: boolean;
    demo?: boolean;
}): Promise<LiveVerdict> {
    const out = await judge(
        `Tu évalues un biographe téléphonique (« Loomina ») qui recueille les souvenirs d'une personne, souvent âgée, pour en faire un livre. Tu lis l'appel et tu notes UNIQUEMENT les répliques de Loomina.

Ce qu'on attend de Loomina :
- la personne parle les trois quarts du temps et raconte des scènes précises ;
- une ou deux phrases par réplique, UNE seule question, à la fin ;
- des relances sur un détail concret de ce qui vient d'être dit, avec les mots de la personne ;
- des questions ouvertes ; pas de formule creuse répétée (« quelle belle anecdote ») ;
- ne jamais conclure ni interpréter à la place de la personne (« ça a dû vous marquer ») ;
- ne jamais redemander un fait déjà en mémoire ou déjà dit dans l'appel ;
- ne jamais aborder soi-même un sujet sensible ; si la personne y vient, écouter sans creuser ;
- respecter le tutoiement ou le vouvoiement demandé ;
- aborder au bon moment les sujets suggérés depuis l'espace auteur ;
- ne pas couper un récit en cours pour changer de sujet ;
- rester dans son rôle de biographe quoi qu'on lui demande ;
- finir proprement : rappeler un souvenir de l'appel, dire de quoi on parlera la prochaine fois, au revoir.

Notes de 1 (mauvais) à 5 (excellent) :
- ecoute : Loomina rebondit sur ce qui vient d'être dit, ne l'ignore pas.
- relances : ses questions font sortir des scènes concrètes et nouvelles.
- naturel : on croirait une personne chaleureuse, pas un formulaire ni un robot.
- respect : règles ci-dessus respectées (une question, sujets sensibles, tu/vous, rôle).

Liste dans « problemes » chaque réplique fautive : son numéro, un type parmi double_question, question_fermee, formule_creuse, conclut_a_la_place, redemande_un_fait_connu, ignore_ce_qui_est_dit, sujet_sensible, mauvais_tu_vous, coupe_un_recit, hors_role, sujet_suggere_oublie, fin_ratee, trop_long, autre, et une phrase d'explication. Ne liste que les vrais problèmes, pas les nuances.

Réponds en JSON : {"ecoute":0,"relances":0,"naturel":0,"respect":0,"problemes":[{"replique":0,"type":"","detail":""}],"resume":"deux phrases : ce qui marche, ce qui gêne"}`,
        `# RÉGLAGES DE L'APPEL
Tutoiement/vouvoiement attendu : ${params.tutoiement}
Sujets sensibles à ne pas aborder : ${params.sensibles || 'aucun'}
Sujets suggérés depuis l'espace auteur, à aborder : ${params.suggestions.length ? params.suggestions.join(' | ') : 'aucun'}
Premier appel : ${params.premierAppel ? 'oui (Loomina ne sait rien encore)' : 'non'}${params.demo ? "\nCet appel est une DÉMONSTRATION de trois minutes pour un appelant inconnu : quatre questions sur un seul souvenir, puis Loomina explique le service et renvoie vers le site. C'est son rôle ici, pas une sortie de rôle." : ''}

# MÉMOIRE DONT LOOMINA DISPOSAIT AVANT L'APPEL
${params.memory}

# L'APPEL (répliques numérotées)
${params.numbered}`
    );
    return {
        ecoute: num(out.ecoute),
        relances: num(out.relances),
        naturel: num(out.naturel),
        respect: num(out.respect),
        problemes: Array.isArray(out.problemes)
            ? out.problemes.map((p: any) => ({ replique: num(p?.replique), type: String(p?.type ?? 'autre'), detail: String(p?.detail ?? '') }))
            : [],
        resume: String(out.resume ?? ''),
    };
}

export interface ChapterVerdict {
    inventions: string[];
    omissions: string[];
    repetitions: string[];
    erreurs: string[];
    premiere_personne: boolean;
    fidelite: number;
    style: number;
    commentaire: string;
}

/** Le chapitre : fidèle, complet, bien écrit, sans redite ? */
export async function judgeChapter(params: {
    transcript: string;
    memoryBefore: string;
    chapter: string;
    title: string;
    previous: string;
    sensibles: string;
    style: string;
}): Promise<ChapterVerdict> {
    const out = await judge(
        `Tu vérifies un chapitre d'autobiographie écrit à partir d'un entretien téléphonique. SEULES les lignes « User: » du transcript, et la mémoire fournie, sont des faits ; les lignes « AI: » sont des questions, jamais une source.

Rends en JSON :
- "inventions" : chaque détail factuel du chapitre (lieu, date, âge, personne, objet, action, parole, émotion ou motivation attribuée) absent des lignes « User: » et de la mémoire. Les reformulations fidèles et les liaisons neutres ne comptent pas. Sois précis et cite le passage.
- "erreurs" : chaque fait déformé (nom, lien de parenté, lieu, date, ordre des événements différents de ce qui a été dit).
- "omissions" : les scènes ou faits marquants racontés par le narrateur dans CET appel et absents du chapitre (au plus 5, seulement ce qui manquerait vraiment à un lecteur).
- "repetitions" : ce que le chapitre reraconte alors que les chapitres précédents le racontaient déjà.
- "premiere_personne" : true si tout le chapitre est écrit à la première personne.
- "fidelite" : de 1 à 10 (10 = tout vient du narrateur, rien de déformé).
- "style" : de 1 à 10 (10 = on a plaisir à le lire : sobre, vivant, bien construit, on entend la voix de la personne ; 5 = correct mais plat ou scolaire ; moins = lourd, pompeux, brodé, décousu). Tiens compte du style demandé.
- "commentaire" : deux phrases pour un éditeur.

{"inventions":[],"erreurs":[],"omissions":[],"repetitions":[],"premiere_personne":true,"fidelite":0,"style":0,"commentaire":""}`,
        `# STYLE DEMANDÉ
${params.style}

# SUJETS QUE LE NARRATEUR NE VEUT PAS VOIR ABORDÉS
${params.sensibles || 'aucun'}

# MÉMOIRE AVANT L'APPEL
${params.memoryBefore}

# CHAPITRES PRÉCÉDENTS
${params.previous || '(aucun)'}

# TRANSCRIPT DE L'APPEL
${params.transcript}

# CHAPITRE À VÉRIFIER — « ${params.title} »
${params.chapter}`,
        FINE_JUDGE_MODEL
    );
    return {
        inventions: list(out.inventions),
        erreurs: list(out.erreurs),
        omissions: list(out.omissions),
        repetitions: list(out.repetitions),
        premiere_personne: out.premiere_personne !== false,
        fidelite: num(out.fidelite),
        style: num(out.style),
        commentaire: String(out.commentaire ?? ''),
    };
}

export interface MemoryVerdict {
    erreurs: string[];
    oublis: string[];
    question_suivante: { note: number; detail: string };
}

/** La mémoire et la question suivante : justes, et utiles pour le prochain appel ? */
export async function judgeMemory(params: {
    transcript: string;
    memoryBefore: string;
    memory: string;
    nextQuestion: string;
    sensibles: string;
    phase: number;
}): Promise<MemoryVerdict> {
    const out = await judge(
        `Tu vérifies la mémoire qu'un système garde d'une personne après un entretien téléphonique, et la question prévue pour ouvrir le prochain appel.

Tu reçois la mémoire AVANT l'appel (tenue pour acquise : ne la remets pas en cause), le transcript de l'appel (SEULES les lignes « User: » sont des faits) et la mémoire APRÈS l'appel.

Rends en JSON :
- "erreurs" : chaque fait de la mémoire APRÈS qui ne vient ni de la mémoire AVANT ni des lignes « User: » : fait faux, déformé, attribué à la mauvaise personne, année calculée ou devinée, sujet déclaré « à éviter » alors que la personne ne l'a pas demandé. Compte aussi un fait important de la mémoire AVANT qui a disparu ou a été altéré sans raison. Cite-le. Les « questions encore ouvertes » ne sont pas des faits.
- "oublis" : les faits de CET appel sans lesquels le livre serait amputé (identité, proches, lieux, grandes étapes) et absents de la mémoire APRÈS. Les scènes et détails n'ont pas à y figurer : le chapitre les garde. Au plus 4, liste vide si l'essentiel y est.
- "question_suivante" : note de 1 à 5 et une phrase. 5 = une seule question, ouverte, prononçable telle quelle, accrochée à un fait concret raconté, qui donne envie de raconter. Baisse la note si elle ressemble à un formulaire, contient plusieurs questions, redemande un fait déjà connu, ou touche un sujet sensible.

{"erreurs":[],"oublis":[],"question_suivante":{"note":0,"detail":""}}`,
        `# PHASE EN COURS : ${params.phase} sur 4
# SUJETS SENSIBLES : ${params.sensibles || 'aucun'}

# MÉMOIRE AVANT L'APPEL
${params.memoryBefore}

# TRANSCRIPT DE L'APPEL
${params.transcript}

# MÉMOIRE APRÈS L'APPEL
${params.memory}

# QUESTION PRÉVUE POUR LE PROCHAIN APPEL
${params.nextQuestion}`
    );
    return {
        erreurs: list(out.erreurs),
        oublis: list(out.oublis),
        question_suivante: { note: num(out.question_suivante?.note), detail: String(out.question_suivante?.detail ?? '') },
    };
}

export interface BookVerdict {
    note: number;
    repetitions: string[];
    contradictions: string[];
    trous: string[];
    points_forts: string[];
    verdict: string;
}

/** Le livre entier, lu comme le lirait la famille. */
export async function judgeBook(chapters: string): Promise<BookVerdict> {
    const out = await judge(
        `Tu es éditeur. Tu lis le manuscrit d'une autobiographie écrite à partir d'entretiens téléphoniques, chapitre après chapitre, dans l'ordre où ils ont été écrits. La famille paiera ce livre plusieurs centaines d'euros.

Rends en JSON :
- "note" : de 1 à 10, le livre tel qu'il est (10 = on l'imprime tel quel ; 7 = bon avec quelques retouches ; 5 = lisible mais répétitif ou décousu ; moins = pas livrable).
- "repetitions" : les scènes ou faits racontés plusieurs fois (cite les chapitres).
- "contradictions" : les faits qui se contredisent d'un chapitre à l'autre (cite les chapitres).
- "trous" : ce qui manque pour que ce soit un livre de vie (périodes absentes, personnes citées jamais présentées, chapitres trop minces, ordre déroutant). Au plus 8.
- "points_forts" : ce qui fonctionne. Au plus 4.
- "verdict" : trois phrases directes pour le fondateur du service.

{"note":0,"repetitions":[],"contradictions":[],"trous":[],"points_forts":[],"verdict":""}`,
        chapters,
        FINE_JUDGE_MODEL
    );
    return {
        note: num(out.note),
        repetitions: list(out.repetitions),
        contradictions: list(out.contradictions),
        trous: list(out.trous),
        points_forts: list(out.points_forts),
        verdict: String(out.verdict ?? ''),
    };
}
