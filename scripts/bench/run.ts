/**
 * Banc d'essai des prompts Loomina.
 *
 *   OPENAI_API_KEY=… npm run bench            tous les cas
 *   OPENAI_API_KEY=… npm run bench -- 01 04   seulement ces cas
 *   BENCH_DIRECTOR_MODEL=gpt-4o npm run bench comparer un autre Directeur
 *
 * Chaque cas de `scripts/bench/cas/` est un entretien type (transcript,
 * mémoire, sujets sensibles, sujets suggérés) et ce qu'on attend en sortie.
 * Le banc fait tourner le VRAI Directeur et le VRAI Écrivain, puis vérifie :
 *   - règles mesurables (matière, longueur, mots interdits, noms épelés,
 *     années non dites, sujets suggérés couverts, question suivante) ;
 *   - un juge (gpt-5.5) qui liste les détails du chapitre absents du
 *     transcript : c'est le chiffre qui compte le plus.
 * Puis une conversation simulée avec l'assistant vocal (un modèle joue le
 * narrateur) pour vérifier qu'il pose une question à la fois, parle court
 * et aborde le sujet suggéré.
 *
 * Aucune écriture en base. Rapport écrit dans scripts/bench/rapports/.
 */

import { readFileSync, readdirSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import OpenAI from 'openai';
import { runDirector } from '../../lib/loomina/director';
import { runWriter } from '../../lib/loomina/writer';
import { checkFidelity } from '../../lib/loomina/book';
import { normalizeContext, renderContext } from '../../lib/loomina/context';
import { buildAssistant } from '../../lib/loomina/assistant';
import { toPhase } from '../../lib/loomina/phases';
import type { Profile, Project } from '../../lib/loomina/db';

interface Case {
    nom: string;
    phase: number;
    prenom: string;
    tutoiement: 'tu' | 'vous';
    sujets_sensibles: string;
    contexte: Record<string, unknown>;
    transcript: string;
    attendu: {
        matiere?: string[];
        suggestions_couvertes?: number[];
        suggestions_non_couvertes?: number[];
        mots_interdits_question?: string[];
        mots_interdits_chapitre?: string[];
        doit_contenir_chapitre?: string[];
        doit_contenir_contexte?: string[];
        annees_interdites?: number[];
        mots_min?: number;
        mots_max?: number;
    };
}

type Check = { ok: boolean; label: string };

const DIR = join(process.cwd(), 'scripts', 'bench');
const JUDGE_MODEL = 'gpt-5.5';
const NARRATOR_MODEL = 'gpt-4.1-mini';
const VOICE_MODEL = process.env.BENCH_VOICE_MODEL ?? 'gpt-4o';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY, maxRetries: 1, timeout: 120_000 });

const has = (text: string, word: string) => text.toLowerCase().includes(word.toLowerCase());

async function judgeInventions(transcript: string, context: string, chapter: string): Promise<string[]> {
    const res = await openai.chat.completions.create({
        model: JUDGE_MODEL,
        reasoning_effort: 'low',
        response_format: { type: 'json_object' },
        messages: [
            {
                role: 'system',
                content:
                    "Tu vérifies un chapitre d'autobiographie. Seules les lignes « User: » du transcript et le contexte fourni sont des faits. Classe chaque élément du chapitre absent de ces sources en deux listes. « faits » : un lieu, une date, une personne, un objet, un événement, une parole, une émotion ou une motivation attribuée, un oubli ou un souvenir affirmé (« je ne me rappelle plus… », « cette phrase m'est restée »). « tournures » : une image, un adjectif ou une liaison de style qui n'ajoute aucune information sur la vie du narrateur. Les reformulations fidèles ne comptent nulle part. Réponds en JSON : {\"faits\": [\"…\"], \"tournures\": [\"…\"]}.",
            },
            { role: 'user', content: `# CONTEXTE\n${context}\n\n# TRANSCRIPT\n${transcript}\n\n# CHAPITRE\n${chapter}` },
        ],
    });
    const parsed = JSON.parse(res.choices[0]?.message?.content ?? '{}');
    const list = (v: unknown) => (Array.isArray(v) ? v.map(String) : []);
    return [...list(parsed.faits), ...list(parsed.tournures).map((t) => `(tournure) ${t}`)];
}

async function runCase(c: Case) {
    const checks: Check[] = [];
    const phase = toPhase(c.phase);
    const context = normalizeContext(c.contexte);
    const t0 = Date.now();

    const director = await runDirector({
        transcript: c.transcript,
        context,
        phase,
        firstName: c.prenom,
        politeness: c.tutoiement,
        durationSeconds: 300,
        sensitiveTopics: c.sujets_sensibles || null,
        model: process.env.BENCH_DIRECTOR_MODEL,
    });
    const tDirector = Date.now() - t0;
    const a = c.attendu;

    if (a.matiere) checks.push({ ok: a.matiere.includes(director.chapter_material), label: `matière « ${director.chapter_material} » (attendu ${a.matiere.join(' ou ')})` });
    for (const n of a.suggestions_couvertes ?? []) checks.push({ ok: director.covered_suggestions.includes(n), label: `sujet suggéré n° ${n} vu comme traité` });
    for (const n of a.suggestions_non_couvertes ?? []) checks.push({ ok: !director.covered_suggestions.includes(n), label: `sujet suggéré n° ${n} gardé pour plus tard` });
    for (const w of a.mots_interdits_question ?? []) checks.push({ ok: !has(director.next_question, w), label: `question suivante sans « ${w} »` });
    const ctxText = renderContext(director.context);
    for (const w of a.doit_contenir_contexte ?? []) checks.push({ ok: ctxText.includes(w), label: `mémoire contient « ${w} »` });
    for (const y of a.annees_interdites ?? []) checks.push({ ok: !director.context.timeline.some((t) => t.year === y), label: `pas d'année ${y} devinée` });

    let chapter = '';
    let words = 0;
    let inventions: string[] = [];
    let tWriter = 0;
    if (director.chapter_material !== 'none') {
        const t1 = Date.now();
        const writer = await runWriter({
            transcript: c.transcript,
            context: director.context,
            previousChapters: [],
            phase,
            writingStyle: null,
            titleHint: director.chapter_title_hint,
            material: director.chapter_material,
            sensitiveTopics: c.sujets_sensibles || null,
        });
        tWriter = Date.now() - t1;
        chapter = writer.chapter_content;
        words = writer.word_count;
        for (const w of a.doit_contenir_chapitre ?? []) checks.push({ ok: chapter.includes(w), label: `chapitre contient « ${w} »` });
        for (const w of a.mots_interdits_chapitre ?? []) checks.push({ ok: !has(chapter, w), label: `chapitre sans « ${w} »` });
        if (a.mots_min) checks.push({ ok: words >= a.mots_min, label: `au moins ${a.mots_min} mots (${words})` });
        if (a.mots_max) checks.push({ ok: words <= a.mots_max, label: `au plus ${a.mots_max} mots (${words})` });
        inventions = await judgeInventions(c.transcript, renderContext(context), chapter);
        const facts = inventions.filter((i) => !i.startsWith('(tournure)')).length;
        checks.push({ ok: facts <= 1, label: `faits inventés : ${facts} (tolérance 1)` });
    }

    return { c, director, chapter, words, inventions, checks, tDirector, tWriter };
}

/**
 * La relecture de fidélité du livre, sur un chapitre où quatre phrases
 * jamais dites ont été glissées, dont deux recopiées du récit (celles du livre de test du 26/11/2026).
 * Elle doit les retirer et garder ce que la personne a vraiment dit.
 */
async function fidelityCheck(): Promise<{ checks: Check[]; content: string }> {
    const source = JSON.parse(readFileSync(join(DIR, 'cas', '06-survol-dense.json'), 'utf8')) as Case;
    const planted = ['Je n’étais pas à ma place là-dedans.', 'Peu à peu, j’ai trouvé ma place.', 'Ma famille est restée là, au centre.', 'L’organisation se faisait comme elle pouvait.', 'Ces vendredis faisaient partie des scènes joyeuses de cette période.', 'Puis ma vie a pris le chemin de l’Angleterre.'];
    const said = ['Là, j’étais vraiment heureuse.', 'Les Anglaises adoraient ça.', 'Nous nous sommes mariés en 1975', 'Nous étions quarante parfois.'];
    const content = `Après mon brevet, mon père a voulu que j’aie un métier. J’ai fait une école de secrétariat. Sténodactylo, ça s’appelait à l’époque. Cela ne me plaisait pas du tout, mais il fallait un métier.

J’ai travaillé environ deux ans dans un bureau d’assurance. C’était très, très ennuyeux. ${planted[0]}

Ensuite, j’ai trouvé une place de vendeuse dans une boutique de prêt-à-porter, à Paris, rue de Passy. J’avais dix-neuf ans. ${said[0]}

## Londres, puis Brighton

${planted[5]}

À Paris, j’ai rencontré David Marchand. Il travaillait dans l’hôtellerie. ${said[2]}, et nous sommes partis à Londres. Au début, je ne parlais pas anglais. C’était très difficile. Puis j’ai appris. À Brighton, j’ai travaillé dans une boutique de mode française, dans les Lanes. ${said[1]} ${planted[1]}

## Les vendredis

Ma mère, avec huit enfants, était à la maison. ${planted[3]} Mes parents sont restés à Saint-Ouen jusqu’au bout. Tous les vendredis soirs, nous étions tous chez eux. ${said[3]} ${planted[4]} ${planted[2]}

## Chez Rose

En 1982, nous sommes rentrés à Paris. J’étais enceinte de ma fille, et je voulais que mes enfants grandissent près de ma famille. Sarah est née en 1982, à Paris. Julien est né en 1985. Quand les enfants étaient petits, je suis restée à la maison trois ou quatre ans. En 1988, j’ai ouvert ma boutique, rue de Lévis, dans le 17e. Elle s’appelait Chez Rose, comme ma mère. Je l’ai gardée vingt-six ans, de 1988 à 2014. J’avais mes clientes, des clientes que j’ai habillées pendant vingt ans, et leurs filles ensuite.

## Aujourd’hui

David et moi avons divorcé en 1996. Nous sommes restés en bons termes, pour les enfants. J’ai eu un compagnon pendant longtemps, Henri, pendant quinze ans à peu près. Il est décédé en 2019. Aujourd’hui, je vis à Paris, toujours dans le 17e. L’été, je vais à Cannes, où j’ai un petit pied-à-terre, parce que j’ai besoin de la mer et du soleil. À Cannes, je nage tous les matins. La brasse, toujours la brasse. Sarah est avocate et elle a trois enfants. Julien vit à Lyon et il a deux enfants. J’ai cinq petits-enfants, et ce sont eux qui m’ont demandé de faire ce livre.`;
    const done = await checkFidelity({ title: 'De Passy à Brighton', content, sources: [1] }, [{ number: 1, title: 'Les grandes lignes de ma vie', content: `Tous les vendredis soirs, nous étions tous chez mes parents. ${planted[4]} ${planted[3]}`, transcript: source.transcript }]);
    const checks: Check[] = [
        ...planted.map((p) => ({ ok: !done.content.includes(p), label: `fidélité : retire « ${p} »` })),
        ...said.map((p) => ({ ok: done.content.includes(p), label: `fidélité : garde « ${p} »` })),
        { ok: done.content.includes('## Londres, puis Brighton'), label: 'fidélité : intertitres gardés' },
    ];
    return { checks, content: done.content };
}

/** Une conversation simulée de 8 tours avec l'assistant vocal. */
async function simulateVoice() {
    const profile = {
        id: 'bench', first_name: 'Marcel', first_name_phonetic: null, last_name: null, full_name: 'Marcel Ferrand',
        email: null, phone_number: null, politeness_preference: 'vous', writing_style: null, sensitive_topics: "la guerre d'Algérie",
    } as Profile;
    const project = {
        id: 'bench', user_id: 'bench', title: null, status: 'active', phase: 2, phase_progress: 30, current_topic_id: null,
        next_question_strategy: 'La dernière fois, vous m\'avez parlé de la boulangerie de vos parents. Racontez-moi une journée là-bas.',
        context: { identity: { full_name: 'Marcel Ferrand' }, last_call: { summary: 'La boulangerie des parents à Roanne.' }, suggested_topics: ['Raconte-nous les vacances chez tante Odette'] },
        // En vrai, chaque souvenir soufflé est rangé dans sa période de vie à
        // l'enregistrement (lib/loomina/suggestion-phase.ts, PR #232). Les
        // vacances d'enfance chez tante Odette sont de la phase 2, celle de
        // l'appel : la voix doit les amener. Sans ce rangement, le sujet tombait
        // dans le cas « période inconnue » et la voix pouvait le garder pour
        // plus tard, d'où un contrôle rouge au hasard.
        project_metadata: { suggestion_phases: { 'raconte-nous les vacances chez tante odette': 2 } }, global_context: null,
    } as unknown as Project;
    const { assistant } = buildAssistant({ profile, project, prompt: null, phase: 2, serverUrl: 'bench' });
    const system = assistant.model.messages[0].content;
    const history: Array<{ role: 'assistant' | 'user'; content: string }> = [{ role: 'assistant', content: assistant.firstMessage }];
    const narrator = "Tu joues Marcel, 79 ans, ancien fils de boulangers à Roanne, au téléphone avec son biographe. Réponds en 1 à 3 phrases, simplement, comme à l'oral. Tu as une tante Odette à Saint-Haon où tu passais tes étés. N'en parle pas toi-même.";

    for (let turn = 0; turn < 8; turn++) {
        const said = await openai.chat.completions.create({
            model: NARRATOR_MODEL,
            temperature: 0.8,
            messages: [{ role: 'system', content: narrator }, ...history.map((m) => ({ role: m.role === 'assistant' ? ('user' as const) : ('assistant' as const), content: m.content }))],
        });
        history.push({ role: 'user', content: said.choices[0]?.message?.content ?? '' });
        const reply = await openai.chat.completions.create({
            model: VOICE_MODEL,
            ...(VOICE_MODEL.startsWith('gpt-4') ? { temperature: 0.7 } : { reasoning_effort: 'none' as const }),
            messages: [{ role: 'system', content: system }, ...history],
        });
        // Comme le serveur vocal (voice/src/session.ts) : la réplique est
        // coupée après sa première question, sauf le marqueur de fin d'appel.
        const raw = reply.choices[0]?.message?.content ?? '';
        const q = raw.indexOf('?');
        const cut = q >= 0 ? raw.slice(0, q + 1) + (raw.includes('##END_CALL##') ? ' ##END_CALL##' : '') : raw;
        history.push({ role: 'assistant', content: cut });
    }

    const replies = history.filter((m) => m.role === 'assistant').slice(1).map((m) => m.content.replace('##END_CALL##', '').trim());
    const checks: Check[] = [
        { ok: replies.every((r) => (r.match(/\?/g) ?? []).length <= 1), label: 'une seule question par réplique' },
        { ok: replies.every((r) => r.split(/\s+/).length <= 40), label: '40 mots au plus par réplique' },
        { ok: replies.some((r) => has(r, 'odette')), label: 'aborde le sujet suggéré (tante Odette)' },
        { ok: !replies.some((r) => has(r, 'algérie')), label: "n'aborde pas le sujet sensible" },
    ];
    return { checks, transcript: history.map((m) => `${m.role === 'assistant' ? 'Loomina' : 'Marcel'} : ${m.content}`).join('\n') };
}

async function main() {
    if (!process.env.OPENAI_API_KEY) {
        console.error('OPENAI_API_KEY manquante.');
        process.exit(2);
    }
    const only = process.argv.slice(2);
    const files = readdirSync(join(DIR, 'cas'))
        .filter((f) => f.endsWith('.json'))
        .filter((f) => !only.length || only.some((o) => f.startsWith(o)))
        .sort();

    const lines: string[] = [`# Banc d'essai des prompts — ${new Date().toISOString().slice(0, 16).replace('T', ' ')}`, ''];
    let failed = 0;
    let total = 0;

    for (const f of files) {
        const c = JSON.parse(readFileSync(join(DIR, 'cas', f), 'utf8')) as Case;
        process.stdout.write(`${f} … `);
        try {
            const r = await runCase(c);
            const ko = r.checks.filter((x) => !x.ok).length;
            failed += ko;
            total += r.checks.length;
            console.log(ko ? `${ko} échec(s)` : 'ok');
            for (const x of r.checks.filter((y) => !y.ok)) console.log(`   ✗ ${x.label}`);
            for (const i of r.inventions) console.log(`   inventé ? ${i}`);
            if (ko) console.log(`   question suivante : ${r.director.next_question}`);
            lines.push(
                `## ${ko ? '❌' : '✅'} ${c.nom} (${f})`,
                `Directeur ${r.director.model} ${(r.tDirector / 1000).toFixed(0)} s · Écrivain ${(r.tWriter / 1000).toFixed(0)} s · ${r.words} mots`,
                '',
                ...r.checks.map((x) => `- ${x.ok ? '✅' : '❌'} ${x.label}`),
                '',
                `**Question suivante :** ${r.director.next_question}`,
                ...(r.inventions.length ? ['', '**Détails inventés selon le juge :**', ...r.inventions.map((i) => `- ${i}`)] : []),
                ...(r.chapter ? ['', '<details><summary>Chapitre</summary>', '', r.chapter, '', '</details>'] : []),
                ''
            );
        } catch (err) {
            failed += 1;
            total += 1;
            console.log(`erreur : ${err instanceof Error ? err.message : String(err)}`);
            lines.push(`## ❌ ${c.nom} (${f})`, `Erreur : ${err instanceof Error ? err.message : String(err)}`, '');
        }
    }

    if (!only.length || only.includes('voix')) {
        process.stdout.write('conversation simulée … ');
        const v = await simulateVoice();
        const ko = v.checks.filter((x) => !x.ok).length;
        failed += ko;
        total += v.checks.length;
        console.log(ko ? `${ko} échec(s) (voix ${VOICE_MODEL})` : `ok (voix ${VOICE_MODEL})`);
        for (const x of v.checks.filter((y) => !y.ok)) console.log(`   ✗ ${x.label}`);
        if (ko) console.log(v.transcript.split('\n').map((l) => `   ${l}`).join('\n'));
        lines.push(`## ${ko ? '❌' : '✅'} Conversation simulée (voix ${VOICE_MODEL})`, '', ...v.checks.map((x) => `- ${x.ok ? '✅' : '❌'} ${x.label}`), '', '<details><summary>Conversation</summary>', '', v.transcript, '', '</details>', '');
    }

    if (!only.length || only.includes('fidelite')) {
        process.stdout.write('relecture de fidélité … ');
        try {
            const r = await fidelityCheck();
            const ko = r.checks.filter((x) => !x.ok).length;
            failed += ko;
            total += r.checks.length;
            console.log(ko ? `${ko} échec(s)` : 'ok');
            for (const x of r.checks.filter((y) => !y.ok)) console.log(`   ✗ ${x.label}`);
            lines.push(`## ${ko ? '❌' : '✅'} Relecture de fidélité du livre`, '', ...r.checks.map((x) => `- ${x.ok ? '✅' : '❌'} ${x.label}`), '', '<details><summary>Chapitre après relecture</summary>', '', r.content, '', '</details>', '');
        } catch (err) {
            failed += 1;
            total += 1;
            console.log(`erreur : ${err instanceof Error ? err.message : String(err)}`);
            lines.push('## ❌ Relecture de fidélité du livre', `Erreur : ${err instanceof Error ? err.message : String(err)}`, '');
        }
    }

    lines.splice(1, 0, `**${total - failed} / ${total} vérifications réussies**`, '');
    mkdirSync(join(DIR, 'rapports'), { recursive: true });
    const out = join(DIR, 'rapports', `${new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-')}.md`);
    writeFileSync(out, lines.join('\n'));
    console.log(`\n${total - failed} / ${total} vérifications réussies. Rapport : ${out}`);
    process.exit(failed ? 1 : 0);
}

void main();
