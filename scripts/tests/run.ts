/**
 * Batterie de tests Loomina : des appels simulés de bout en bout.
 *
 *   npm run test:appels                    toute la galerie + le livre complet
 *   npm run test:appels -- 01 04           seulement ces scénarios
 *   npm run test:appels -- --sans-livre    la galerie sans le livre complet
 *   npm run test:appels -- 20 --livre=10   le livre complet, en 10 appels
 *   npm run test:appels -- --garder        ne pas effacer les profils de test à la fin
 *   npm run test:appels -- --nettoyer      effacer les profils de test, rien d'autre
 *
 * Chaque scénario crée un profil de test (faux numéro, SMS coupés), fait
 * jouer le narrateur par un modèle face au VRAI serveur vocal, laisse le
 * vrai traitement de fin d'appel écrire en base, puis contrôle l'appel, le
 * chapitre et la base. Rapport dans scripts/tests/rapports/.
 */

import './lib/env';
import fs from 'node:fs';
import path from 'node:path';
import { SITE_URL, SPEED } from './lib/env';
import { startStack, stopStack, waitProcessed } from './lib/pile';
import type { Processed } from './lib/pile';
import { createAccount, snapshot, cleanup, unknownPhone } from './lib/profils';
import type { TestAccount, Snapshot } from './lib/profils';
import { simulateCall, renderTurns } from './lib/appel';
import type { CallResult } from './lib/appel';
import { liveChecks, dbChecks, judgedReplies } from './lib/controles';
import type { Check, LiveStats } from './lib/controles';
import { judgeLive, judgeChapter, judgeMemory, judgeBook, JUDGE_MODEL } from './lib/juges';
import type { LiveVerdict, ChapterVerdict, MemoryVerdict, BookVerdict } from './lib/juges';
import { NARRATOR_MODEL } from './lib/narrateur';
import { SCENARIOS, LIVRE } from './scenarios';
import type { Scenario } from './scenarios';
import { db } from '../../lib/loomina/db';
import { processEvent } from '../../lib/loomina/events';
import { normalizeContext, renderContext } from '../../lib/loomina/context';
import { DIRECTOR_MODEL } from '../../lib/loomina/director';
import { WRITER_MODEL } from '../../lib/loomina/writer';

interface CallRecord {
    n: number;
    call: CallResult;
    processed: Processed | null;
    before: Snapshot | null;
    after: Snapshot | null;
    stats: LiveStats;
    live: LiveVerdict | null;
    chapter: ChapterVerdict | null;
    memory: MemoryVerdict | null;
    checks: Check[];
}

interface ScenarioResult {
    scenario: Scenario;
    calls: CallRecord[];
    checks: Check[];
    book: BookVerdict | null;
    error: string | null;
    seconds: number;
}

const args = process.argv.slice(2);
const flag = (name: string) => args.includes(`--${name}`);
const option = (name: string) => args.find((a) => a.startsWith(`--${name}=`))?.split('=')[1];
const only = args.filter((a) => !a.startsWith('--'));
const stamp = new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-');
const runId = stamp.replace(/-/g, '').slice(4);
const DIR = path.join(process.cwd(), 'scripts', 'tests', 'rapports', stamp);

const say = (id: string, text: string) => console.log(`[${new Date().toISOString().slice(11, 19)}] ${id.padEnd(20)} ${text}`);
const avg = (v: number[]) => (v.length ? v.reduce((a, b) => a + b, 0) / v.length : 0);

function numbered(call: CallResult, name: string): string {
    return call.turns.map((t, i) => `${i + 1}. ${t.role === 'loomina' ? 'Loomina' : name} : ${t.text}${t.interrupted ? ' [coupée par le narrateur]' : ''}${t.unprompted ? ' [phrase automatique]' : ''}`).join('\n');
}

function previousChapters(snap: Snapshot): string {
    return snap.chapters.slice(-6).map((c) => `## Chapitre ${c.chapter_number} — ${c.title}\n${String(c.content_markdown).slice(0, 3000)}`).join('\n\n');
}

function judgeChecks(live: LiveVerdict | null, chapter: ChapterVerdict | null, memory: MemoryVerdict | null): Check[] {
    const out: Check[] = [];
    if (live) {
        const mean = avg([live.ecoute, live.relances, live.naturel, live.respect]);
        out.push({ ok: mean >= 3.5, gravite: 'important', domaine: 'direct', label: `qualité de l'entretien selon le juge : écoute ${live.ecoute}/5, relances ${live.relances}/5, naturel ${live.naturel}/5, règles ${live.respect}/5` });
        const grave = live.problemes.filter((p) => ['sujet_sensible', 'hors_role'].includes(p.type));
        for (const p of grave) out.push({ ok: false, gravite: 'bloquant', domaine: 'direct', label: `réplique ${p.replique} (${p.type}) : ${p.detail}` });
        const others = live.problemes.filter((p) => !grave.includes(p));
        if (others.length) out.push({ ok: others.length <= 2, gravite: 'mineur', domaine: 'direct', label: `${others.length} réplique(s) critiquée(s) par le juge : ${others.map((p) => `n° ${p.replique} ${p.type}`).join(', ')}` });
    }
    if (chapter) {
        out.push({ ok: chapter.inventions.length <= 2, gravite: chapter.inventions.length > 5 ? 'bloquant' : 'important', domaine: 'chapitre', label: `détails inventés dans le chapitre : ${chapter.inventions.length} (tolérance 2)` });
        out.push({ ok: chapter.erreurs.length === 0, gravite: 'important', domaine: 'chapitre', label: `faits déformés dans le chapitre : ${chapter.erreurs.length}` });
        out.push({ ok: chapter.repetitions.length === 0, gravite: 'important', domaine: 'chapitre', label: `redites avec les chapitres précédents : ${chapter.repetitions.length}` });
        out.push({ ok: chapter.premiere_personne, gravite: 'bloquant', domaine: 'chapitre', label: 'chapitre écrit à la première personne' });
        out.push({ ok: chapter.style >= 7, gravite: 'important', domaine: 'chapitre', label: `style du chapitre : ${chapter.style}/10, fidélité ${chapter.fidelite}/10` });
        out.push({ ok: chapter.omissions.length <= 2, gravite: 'mineur', domaine: 'chapitre', label: `scènes marquantes oubliées par le chapitre : ${chapter.omissions.length}` });
    }
    if (memory) {
        out.push({ ok: memory.erreurs.length === 0, gravite: memory.erreurs.length > 2 ? 'bloquant' : 'important', domaine: 'memoire', label: `faits faux ou devinés dans la mémoire : ${memory.erreurs.length}` });
        out.push({ ok: memory.oublis.length <= 2, gravite: 'mineur', domaine: 'memoire', label: `faits importants absents de la mémoire : ${memory.oublis.length}` });
        out.push({ ok: memory.question_suivante.note >= 4, gravite: 'important', domaine: 'memoire', label: `question prévue pour le prochain appel : ${memory.question_suivante.note}/5 — ${memory.question_suivante.detail}` });
    }
    return out;
}

/** Doublon du rapport, rejeu de l'événement, puis Écrivain en échec et repris. */
async function replayChecks(account: TestAccount, record: CallRecord): Promise<Check[]> {
    const checks: Check[] = [];
    const T = (ok: boolean, label: string) => checks.push({ ok, label, gravite: 'bloquant', domaine: 'technique' });
    const eventId = record.processed?.eventId;
    const base = record.after;
    if (!eventId || !base) return checks;
    const supabase = db();
    const same = (a: Snapshot, b: Snapshot) => JSON.stringify(a.project.context) === JSON.stringify(b.project.context) && a.project.phase === b.project.phase && a.project.next_question_strategy === b.project.next_question_strategy;

    // 1. Le serveur vocal renvoie deux fois le même rapport.
    const { data: ev } = await supabase.from('call_events').select('payload').eq('id', eventId).single();
    const res = await fetch(`${SITE_URL}/api/vapi/webhook`, { method: 'POST', headers: { 'content-type': 'application/json', 'x-vapi-secret': process.env.VAPI_WEBHOOK_SECRET ?? '' }, body: JSON.stringify(ev?.payload) });
    const answer = (await res.json()) as { duplicate?: boolean };
    let snap = await snapshot(account);
    T(answer.duplicate === true && snap.events.length === base.events.length && snap.interviews.length === base.interviews.length && snap.chapters.length === base.chapters.length, 'rapport reçu deux fois : reconnu comme doublon, rien n\'est écrit en plus');

    // 2. Le rattrapage reprend un événement déjà traité.
    await supabase.from('call_events').update({ status: 'pending' }).eq('id', eventId);
    const again = await processEvent(eventId).catch((e) => ({ status: `erreur ${e instanceof Error ? e.message : e}` }));
    snap = await snapshot(account);
    T(again?.status === 'processed' && snap.interviews.length === base.interviews.length && snap.chapters.length === base.chapters.length && same(snap, base), `événement rejoué : ni second entretien, ni second chapitre, mémoire et phase intactes (${again?.status})`);

    // 3. L'Écrivain a échoué : l'analyse est en base, pas le chapitre.
    const interview = base.interviews[base.interviews.length - 1];
    const chapter = base.chapters.find((c) => c.latest_interview_id === interview.id);
    if (chapter) {
        await supabase.from('chapters').delete().eq('id', chapter.id);
        await supabase.from('interviews').update({ processing_status: 'pending' }).eq('id', interview.id);
        await supabase.from('call_events').update({ status: 'pending' }).eq('id', eventId);
        const retry = await processEvent(eventId).catch((e) => ({ status: `erreur ${e instanceof Error ? e.message : e}` }));
        snap = await snapshot(account);
        const rewritten = snap.chapters.filter((c) => c.latest_interview_id === interview.id);
        const sameAnalysis = snap.interviews[snap.interviews.length - 1]?.ai_analysis_log?.at === interview.ai_analysis_log?.at;
        T(retry?.status === 'processed' && rewritten.length === 1 && rewritten[0].chapter_number === chapter.chapter_number, `Écrivain en échec puis repris : le chapitre est réécrit une seule fois, au même numéro (${retry?.status})`);
        T(sameAnalysis && same(snap, base), 'reprise après échec de l\'Écrivain : le Directeur n\'est pas relancé, mémoire et phase intactes');
    }
    return checks;
}

async function runScenario(sc: Scenario): Promise<ScenarioResult> {
    const t0 = Date.now();
    const result: ScenarioResult = { scenario: sc, calls: [], checks: [], book: null, error: null, seconds: 0 };
    const dir = path.join(DIR, sc.id);
    fs.mkdirSync(dir, { recursive: true });
    try {
        const account = sc.inconnu || !sc.seed ? null : await createAccount(sc.seed, runId);
        const phone = account?.phone ?? unknownPhone();
        const total = sc.appels ?? 1;
        const told: string[] = [];

        for (let n = 1; n <= total; n++) {
            const before = account ? await snapshot(account) : null;
            if (before?.project.status === 'completed') { say(sc.id, `livre terminé avant l'appel ${n}`); break; }
            const consignes = [
                sc.persona.consignes,
                sc.consignesParAppel?.[n],
                told.length ? `Ce que tu as déjà raconté aux appels précédents (reste cohérente avec ça, et ne le reraconte pas de toi-même) :\n${told.join('\n').slice(-7000)}` : null,
            ].filter(Boolean).join('\n\n');
            say(sc.id, `appel ${n}/${total}…`);
            const call = await simulateCall({ phone, persona: { ...sc.persona, consignes }, behaviour: sc.behaviour, callNumber: n });
            fs.writeFileSync(path.join(dir, `appel-${n}.md`), renderTurns(call.turns, sc.persona.prenom));
            told.push(...call.turns.filter((t) => t.role === 'narrateur').map((t) => `- ${t.text}`));

            const tutoiement = (before?.profile.politeness_preference as 'tu' | 'vous' | undefined) ?? (sc.inconnu ? 'vous' : null);
            const { checks, stats } = liveChecks(call, n === 1 || total === 1 ? sc.attendu : { ...sc.attendu, fin: undefined }, sc.attendu.profilTu ? 'tu' : tutoiement);
            const record: CallRecord = { n, call, processed: null, before, after: null, stats, live: null, chapter: null, memory: null, checks };
            result.calls.push(record);

            const memoryBefore = before ? renderContext(normalizeContext(before.project.context)) : '(appelant inconnu : démonstration, aucune mémoire)';
            const livePromise = judgedReplies(call.turns).length >= 2
                ? judgeLive({
                      numbered: numbered(call, sc.persona.prenom),
                      memory: memoryBefore,
                      tutoiement: sc.attendu.profilTu ? 'à demander au début, puis « tu »' : tutoiement ?? 'vous',
                      sensibles: before?.profile.sensitive_topics ?? '',
                      suggestions: before ? normalizeContext(before.project.context).suggested_topics ?? [] : [],
                      premierAppel: !before || before.interviews.length === 0,
                  }).catch(() => null)
                : Promise.resolve(null);

            if (!account) {
                // Démonstration : rien ne doit être écrit.
                await new Promise((r) => setTimeout(r, 4000));
                const { data: stored } = await db().from('call_events').select('id').eq('vapi_call_id', call.callSid);
                record.checks.push({ ok: call.turns.length > 2, gravite: 'bloquant', domaine: 'direct', label: 'l\'appelant inconnu a bien une démonstration' });
                record.checks.push({ ok: (stored ?? []).length === 0, gravite: 'bloquant', domaine: 'base', label: 'démonstration : rien n\'est écrit en base' });
                record.live = await livePromise;
                record.checks.push(...judgeChecks(record.live, null, null));
                continue;
            }

            say(sc.id, `appel ${n} fini (${call.endedBy}, ${call.seconds} s, ${call.turns.length} répliques) ; traitement…`);
            const processed = await waitProcessed(call.callSid);
            record.processed = processed;
            const after = await snapshot(account);
            record.after = after;
            record.checks.push(...dbChecks({ before: before!, after, processed, call, attendu: sc.attendu }));

            const interview = after.interviews.find((i) => i.call_event_id === processed?.eventId);
            const chapter = after.chapters.find((c) => c.latest_interview_id === interview?.id);
            const [live, chapterVerdict, memory] = await Promise.all([
                livePromise,
                chapter && interview
                    ? judgeChapter({
                          transcript: interview.transcript,
                          memoryBefore,
                          chapter: chapter.content_markdown,
                          title: chapter.title,
                          previous: previousChapters(before!),
                          sensibles: after.profile.sensitive_topics ?? '',
                          style: after.profile.writing_style ?? 'Naturel',
                      }).catch(() => null)
                    : Promise.resolve(null),
                processed?.outcome && processed.outcome.status !== 'too_short'
                    ? judgeMemory({
                          transcripts: after.interviews.map((i, k) => `## Entretien ${k + 1}\n${i.transcript}`).join('\n\n').slice(-60000),
                          memory: renderContext(normalizeContext(after.project.context)),
                          nextQuestion: after.project.next_question_strategy ?? '',
                          sensibles: after.profile.sensitive_topics ?? '',
                          phase: after.project.phase,
                      }).catch(() => null)
                    : Promise.resolve(null),
            ]);
            record.live = live;
            record.chapter = chapterVerdict;
            record.memory = memory;
            record.checks.push(...judgeChecks(live, chapterVerdict, memory));
            if (chapter) fs.writeFileSync(path.join(dir, `chapitre-${chapter.chapter_number}.md`), `# ${chapter.title}\n\n${chapter.content_markdown}`);
            fs.writeFileSync(path.join(dir, `base-apres-appel-${n}.json`), JSON.stringify(after, null, 2));
            say(sc.id, `appel ${n} : ${processed?.outcome?.status ?? processed?.error ?? 'sans réponse'}, phase ${after.project.phase} à ${after.project.phase_progress} %, ${record.checks.filter((c) => !c.ok).length} contrôle(s) en échec`);

            if (sc.rejeux && n === total) {
                const replays = await replayChecks(account, record);
                result.checks.push(...replays);
                say(sc.id, `rejeux : ${replays.filter((c) => !c.ok).length} échec(s) sur ${replays.length}`);
            }
        }

        if (account && total > 1) {
            const final = await snapshot(account);
            const phases = result.calls.map((c) => `${c.after?.project.phase}:${c.after?.project.phase_progress}%`).join(' → ');
            result.checks.push({ ok: final.chapters.length >= Math.ceil(result.calls.length * 0.7), gravite: 'important', domaine: 'livre', label: `${final.chapters.length} chapitres pour ${result.calls.length} appels, ${final.chapters.reduce((a, c) => a + c.word_count, 0)} mots au total` });
            result.checks.push({ ok: final.project.phase >= 3, gravite: 'important', domaine: 'livre', label: `avancée dans les phases après ${result.calls.length} appels (phase:progression) : ${phases}` });
            const book = final.chapters.map((c) => `## Chapitre ${c.chapter_number} — ${c.title}\n\n${c.content_markdown}`).join('\n\n');
            fs.writeFileSync(path.join(dir, 'livre.md'), `# ${final.project.title}\n\n${book}`);
            if (final.chapters.length >= 2) {
                result.book = await judgeBook(book).catch(() => null);
                if (result.book) {
                    result.checks.push({ ok: result.book.note >= 7, gravite: 'important', domaine: 'livre', label: `le livre entier selon l'éditeur : ${result.book.note}/10` });
                    result.checks.push({ ok: result.book.repetitions.length === 0, gravite: 'important', domaine: 'livre', label: `scènes racontées plusieurs fois dans le livre : ${result.book.repetitions.length}` });
                    result.checks.push({ ok: result.book.contradictions.length === 0, gravite: 'important', domaine: 'livre', label: `contradictions d'un chapitre à l'autre : ${result.book.contradictions.length}` });
                }
            }
        }
    } catch (err) {
        result.error = err instanceof Error ? `${err.message}\n${err.stack}` : String(err);
        say(sc.id, `ERREUR : ${result.error.split('\n')[0]}`);
    }
    result.seconds = Math.round((Date.now() - t0) / 1000);
    return result;
}

// ------------------------------------------------------------
// Rapport
// ------------------------------------------------------------

const allChecks = (r: ScenarioResult): Check[] => [...r.calls.flatMap((c) => c.checks), ...r.checks];
const mark = (c: Check) => (c.ok ? '✅' : c.gravite === 'bloquant' ? '🟥' : c.gravite === 'important' ? '🟧' : '🟨');

function verdict(r: ScenarioResult): string {
    if (r.error) return '💥';
    const ko = allChecks(r).filter((c) => !c.ok);
    if (ko.some((c) => c.gravite === 'bloquant')) return '🟥';
    if (ko.some((c) => c.gravite === 'important')) return '🟧';
    return ko.length ? '🟨' : '✅';
}

function report(results: ScenarioResult[]): string {
    const L: string[] = [];
    const checks = results.flatMap(allChecks);
    const ko = checks.filter((c) => !c.ok);
    const lat = results.flatMap((r) => r.calls.flatMap((c) => c.call.turns.filter((t) => t.firstTokenMs !== undefined).map((t) => t.firstTokenMs as number))).sort((a, b) => a - b);
    const lives = results.flatMap((r) => r.calls.map((c) => c.live)).filter(Boolean) as LiveVerdict[];
    const chapters = results.flatMap((r) => r.calls.map((c) => c.chapter)).filter(Boolean) as ChapterVerdict[];
    const pipeline = results.flatMap((r) => r.calls.map((c) => c.processed?.ms)).filter(Boolean) as number[];

    L.push(`# Batterie de tests Loomina — ${stamp.slice(0, 10)} ${stamp.slice(11).replace('-', ':')}`, '');
    L.push(`**${checks.length - ko.length} contrôles réussis sur ${checks.length}.** En échec : ${ko.filter((c) => c.gravite === 'bloquant').length} bloquant(s) 🟥, ${ko.filter((c) => c.gravite === 'important').length} important(s) 🟧, ${ko.filter((c) => c.gravite === 'mineur').length} mineur(s) 🟨.`, '');
    L.push(`${results.length} scénarios, ${results.reduce((a, r) => a + r.calls.length, 0)} appels simulés. Voix ${process.env.VOICE_MODEL ?? 'gpt-4.1'}, Directeur ${DIRECTOR_MODEL}, Écrivain ${WRITER_MODEL}, narrateur joué par ${NARRATOR_MODEL}, juge ${JUDGE_MODEL}. Parole simulée accélérée ${SPEED} fois : les durées d'appel ne sont pas réalistes, les temps de réponse du cerveau le sont.`, '');

    L.push('## En chiffres', '');
    if (lat.length) L.push(`- **Temps de réponse du cerveau** (du dernier mot du narrateur au premier mot de Loomina, sans la voix ni la transcription) : médiane ${lat[Math.floor(lat.length / 2)]} ms, 95 % sous ${lat[Math.floor(lat.length * 0.95)]} ms, pire ${lat[lat.length - 1]} ms, sur ${lat.length} répliques.`);
    if (lives.length) L.push(`- **Entretien en direct** (juge, sur 5) : écoute ${avg(lives.map((l) => l.ecoute)).toFixed(1)}, relances ${avg(lives.map((l) => l.relances)).toFixed(1)}, naturel ${avg(lives.map((l) => l.naturel)).toFixed(1)}, respect des règles ${avg(lives.map((l) => l.respect)).toFixed(1)}.`);
    const replies = results.reduce((a, r) => a + r.calls.reduce((b, c) => b + c.stats.repliques, 0), 0);
    const dq = results.reduce((a, r) => a + r.calls.reduce((b, c) => b + c.stats.doubleQuestions, 0), 0);
    if (replies) L.push(`- **Une question à la fois** : ${dq} répliques sur ${replies} en posent plusieurs (${Math.round((100 * dq) / replies)} %).`);
    if (chapters.length) L.push(`- **Chapitres** (${chapters.length}) : fidélité ${avg(chapters.map((c) => c.fidelite)).toFixed(1)}/10, style ${avg(chapters.map((c) => c.style)).toFixed(1)}/10, ${avg(chapters.map((c) => c.inventions.length)).toFixed(1)} détail inventé par chapitre en moyenne (pire : ${Math.max(...chapters.map((c) => c.inventions.length))}).`);
    if (pipeline.length) L.push(`- **Après l'appel** (Directeur, Écrivain, base) : ${Math.round(avg(pipeline) / 1000)} s en moyenne, ${Math.round(Math.max(...pipeline) / 1000)} s au pire.`);
    L.push('');

    L.push('## Vue d\'ensemble', '', '| | Scénario | Ce qu\'on cherche à savoir | Échecs |', '|---|---|---|---|');
    for (const r of results) {
        const k = allChecks(r).filter((c) => !c.ok);
        L.push(`| ${verdict(r)} | ${r.scenario.titre} | ${r.scenario.question} | ${r.error ? 'erreur du banc' : k.length ? `${k.filter((c) => c.gravite === 'bloquant').length} 🟥 ${k.filter((c) => c.gravite === 'important').length} 🟧 ${k.filter((c) => c.gravite === 'mineur').length} 🟨` : '—'} |`);
    }
    L.push('');

    for (const g of ['bloquant', 'important'] as const) {
        const list = results.flatMap((r) => allChecks(r).filter((c) => !c.ok && c.gravite === g).map((c) => ({ r, c })));
        if (!list.length) continue;
        L.push(`## ${g === 'bloquant' ? '🟥 Bloquants' : '🟧 Importants'}`, '');
        for (const { r, c } of list) L.push(`- **${r.scenario.titre}** (${c.domaine}) : ${c.label}`);
        L.push('');
    }

    L.push('## Scénario par scénario', '');
    for (const r of results) {
        L.push(`### ${verdict(r)} ${r.scenario.titre} (${r.scenario.id})`, '', `*${r.scenario.question}*`, '');
        if (r.error) L.push('```', r.error, '```', '');
        for (const c of r.calls) {
            if (r.calls.length > 1) L.push(`#### Appel ${c.n}`, '');
            L.push(`Fin : ${c.call.endedBy}, ${c.call.turns.length} répliques, le narrateur parle ${Math.round(c.stats.partNarrateur * 100)} % du temps. Issue : ${c.processed?.outcome?.status ?? (c.processed?.error ? 'erreur' : '—')}${c.after ? `, phase ${c.after.project.phase} à ${c.after.project.phase_progress} %` : ''}.`, '');
            for (const k of c.checks) L.push(`- ${mark(k)} ${k.label}`);
            L.push('');
            if (c.live) {
                L.push(`**Le juge sur l'entretien :** ${c.live.resume}`);
                for (const p of c.live.problemes) L.push(`- réplique ${p.replique}, ${p.type} : ${p.detail}`);
                L.push('');
            }
            if (c.chapter) {
                L.push(`**Le juge sur le chapitre :** ${c.chapter.commentaire}`);
                for (const [label, items] of [['Inventé', c.chapter.inventions], ['Déformé', c.chapter.erreurs], ['Oublié', c.chapter.omissions], ['Redit', c.chapter.repetitions]] as const) for (const i of items) L.push(`- ${label} : ${i}`);
                L.push('');
            }
            if (c.memory && (c.memory.erreurs.length || c.memory.oublis.length)) {
                L.push('**Le juge sur la mémoire :**');
                for (const e of c.memory.erreurs) L.push(`- Faux ou deviné : ${e}`);
                for (const o of c.memory.oublis) L.push(`- Absent : ${o}`);
                L.push('');
            }
            if (c.after) L.push(`**Question prévue pour le prochain appel :** ${c.after.project.next_question_strategy ?? '—'}`, '');
            L.push('<details><summary>L\'appel</summary>', '', renderTurns(c.call.turns, r.scenario.persona.prenom), '', '</details>', '');
            const interview = c.after?.interviews.find((i) => i.call_event_id === c.processed?.eventId);
            const chapter = c.after?.chapters.find((x) => x.latest_interview_id === interview?.id);
            if (chapter) L.push(`<details><summary>Le chapitre : « ${chapter.title} » (${chapter.word_count} mots)</summary>`, '', chapter.content_markdown, '', '</details>', '');
            if (c.after) L.push('<details><summary>La mémoire après l\'appel</summary>', '', renderContext(normalizeContext(c.after.project.context)), '', `Proches en base : ${c.after.family.map((f) => `${f.full_name} (${f.relation})`).join(', ') || 'aucun'}. Sujets sensibles : ${c.after.profile.sensitive_topics ?? 'aucun'}. Tutoiement : ${c.after.profile.politeness_preference}.`, '', '</details>', '');
        }
        if (r.checks.length) {
            L.push(r.calls.length > 1 ? '#### Le livre entier' : '#### Rejeux et pannes', '');
            for (const k of r.checks) L.push(`- ${mark(k)} ${k.label}`);
            L.push('');
        }
        if (r.book) {
            L.push(`**L'éditeur :** ${r.book.verdict}`, '');
            for (const [label, items] of [['Redite', r.book.repetitions], ['Contradiction', r.book.contradictions], ['Manque', r.book.trous], ['Point fort', r.book.points_forts]] as const) for (const i of items) L.push(`- ${label} : ${i}`);
            L.push('');
        }
    }
    return L.join('\n');
}

async function pool<T, R>(items: T[], size: number, fn: (item: T) => Promise<R>): Promise<R[]> {
    const out: R[] = new Array(items.length);
    let next = 0;
    await Promise.all(Array.from({ length: Math.min(size, items.length) }, async () => {
        while (next < items.length) {
            const i = next++;
            out[i] = await fn(items[i]);
        }
    }));
    return out;
}

async function main() {
    if (flag('nettoyer')) {
        console.log(`${await cleanup()} profil(s) de test effacé(s).`);
        return;
    }
    const livre: Scenario = { ...LIVRE, appels: Number(option('livre') ?? LIVRE.appels) };
    const candidates = [...SCENARIOS, ...(flag('sans-livre') ? [] : [livre])];
    const selected = candidates.filter((s) => !only.length || only.some((o) => s.id.startsWith(o)));
    if (!selected.length) { console.error('Aucun scénario ne correspond.'); process.exit(2); }

    fs.mkdirSync(DIR, { recursive: true });
    const stale = await cleanup();
    if (stale) console.log(`${stale} profil(s) de test d'une série précédente effacé(s).`);
    await startStack(DIR);
    console.log(`${selected.length} scénario(s). Rapport : ${DIR}\n`);

    const singles = selected.filter((s) => (s.appels ?? 1) === 1);
    const books = selected.filter((s) => (s.appels ?? 1) > 1);
    const size = Number(option('paralleles') ?? 4);
    const [a, b] = await Promise.all([pool(singles, size, runScenario), pool(books, 2, runScenario)]);
    const results = [...a, ...b].sort((x, y) => x.scenario.id.localeCompare(y.scenario.id));

    const md = report(results);
    fs.writeFileSync(path.join(DIR, 'rapport.md'), md);
    fs.writeFileSync(path.join(DIR, 'resultats.json'), JSON.stringify(results, null, 2));

    await stopStack();
    if (flag('garder')) console.log('\nProfils de test gardés en base (--nettoyer pour les effacer).');
    else console.log(`\n${await cleanup()} profil(s) de test effacé(s).`);

    const checks = results.flatMap(allChecks);
    const ko = checks.filter((c) => !c.ok);
    console.log(`${checks.length - ko.length} / ${checks.length} contrôles réussis — ${ko.filter((c) => c.gravite === 'bloquant').length} bloquant(s), ${ko.filter((c) => c.gravite === 'important').length} important(s), ${ko.filter((c) => c.gravite === 'mineur').length} mineur(s).`);
    console.log(`Rapport : ${path.join(DIR, 'rapport.md')}`);
    process.exit(ko.some((c) => c.gravite === 'bloquant') || results.some((r) => r.error) ? 1 : 0);
}

main().catch(async (err) => {
    console.error(err);
    await stopStack().catch(() => undefined);
    process.exit(1);
});
