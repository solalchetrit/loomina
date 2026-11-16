/**
 * Les contrôles mesurables : ce qu'on peut vérifier sans juge, sur les
 * répliques de Loomina et sur ce que l'appel a laissé dans la base.
 */

import type { Turn, CallResult } from './appel';
import type { Snapshot } from './profils';
import type { Processed } from './pile';
import type { Expectation } from '../scenarios';
import { normalizeContext, renderContext } from '../../../lib/loomina/context';
import { countWords } from '../../../lib/loomina/writer';

export type Gravite = 'bloquant' | 'important' | 'mineur';
export interface Check {
    ok: boolean;
    label: string;
    gravite: Gravite;
    domaine: 'direct' | 'chapitre' | 'base' | 'memoire' | 'livre' | 'technique';
}

// Limites de mots qui tiennent compte des accents (« êtes » ne contient pas « tes »).
const TU = /(?<!\p{L})(tu|toi|ton|ta|tes)(?!\p{L})|(?<!\p{L})t['’]/iu;
const VOUS = /(?<!\p{L})(vous|votre|vos)(?!\p{L})/iu;

const words = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;
const has = (text: string, w: string) => text.toLowerCase().includes(w.toLowerCase());
const pct = (n: number, d: number) => (d ? Math.round((100 * n) / d) : 0);

export function percentile(values: number[], p: number): number {
    if (!values.length) return 0;
    const sorted = [...values].sort((a, b) => a - b);
    return sorted[Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length))];
}

export interface LiveStats {
    repliques: number;
    doubleQuestions: number;
    longues: number;
    motsMedian: number;
    partNarrateur: number;
    latenceP50: number;
    latenceP95: number;
    latenceMax: number;
}

/** Les répliques de Loomina qu'on juge : pas la salutation, ni les phrases coupées ou automatiques. */
export function judgedReplies(turns: Turn[]): Turn[] {
    return turns.filter((t, i) => t.role === 'loomina' && i > 0 && !t.interrupted && !t.unprompted && t.text);
}

export function liveChecks(call: CallResult, attendu: Expectation, tutoiement: 'tu' | 'vous' | null): { checks: Check[]; stats: LiveStats } {
    const checks: Check[] = [];
    const replies = judgedReplies(call.turns);
    // La dernière réplique (l'au revoir) a le droit d'être plus longue.
    const body = replies.slice(0, -1);
    const lat = call.turns.filter((t) => t.role === 'loomina' && t.firstTokenMs !== undefined).map((t) => t.firstTokenMs as number);
    const narratorWords = call.turns.filter((t) => t.role === 'narrateur').reduce((a, t) => a + words(t.text), 0);
    const loominaWords = call.turns.filter((t) => t.role === 'loomina').reduce((a, t) => a + words(t.text), 0);

    const dq = replies.filter((r) => (r.text.match(/\?/g) ?? []).length > 1).length;
    const long = body.filter((r) => words(r.text) > 40).length;
    const stats: LiveStats = {
        repliques: replies.length,
        doubleQuestions: dq,
        longues: long,
        motsMedian: percentile(body.map((r) => words(r.text)), 50),
        partNarrateur: narratorWords + loominaWords ? narratorWords / (narratorWords + loominaWords) : 0,
        latenceP50: percentile(lat, 50),
        latenceP95: percentile(lat, 95),
        latenceMax: lat.length ? Math.max(...lat) : 0,
    };

    if (replies.length >= 3) {
        checks.push({ ok: dq === 0, gravite: dq > replies.length * 0.2 ? 'important' : 'mineur', domaine: 'direct', label: `une seule question par réplique (${dq} réplique(s) sur ${replies.length} en posent plusieurs)` });
        checks.push({ ok: long <= body.length * 0.15, gravite: 'mineur', domaine: 'direct', label: `répliques courtes (${long} sur ${body.length} dépassent 40 mots, médiane ${stats.motsMedian} mots)` });
    }
    const all = call.turns.filter((t) => t.role === 'loomina').map((t) => t.text);
    checks.push({ ok: !all.some((t) => /(^|\n)\s*([-*•]|\d+\.)\s/.test(t) || /[*#_]{2}/.test(t)), gravite: 'mineur', domaine: 'direct', label: 'ni liste ni mise en forme dans ce qui est lu à voix haute' });
    checks.push({ ok: !all.some((t) => t.includes('#') || has(t, 'END_CALL')), gravite: 'important', domaine: 'direct', label: 'le marqueur de fin d\'appel n\'est jamais prononcé' });
    checks.push({ ok: !all.slice(1).some((t) => /Loomina/.test(t)), gravite: 'mineur', domaine: 'direct', label: 'la marque est écrite « Loumina » pour la voix' });
    if (lat.length >= 3) {
        checks.push({ ok: stats.latenceP95 <= 2500, gravite: stats.latenceP95 > 4000 ? 'important' : 'mineur', domaine: 'direct', label: `temps de réponse du cerveau : médiane ${stats.latenceP50} ms, 95 % sous ${stats.latenceP95} ms, pire ${stats.latenceMax} ms` });
    }

    // Sujets sensibles : Loomina ne doit pas y venir la première.
    for (const w of attendu.motsSensibles ?? []) {
        let narratorSaid = false;
        let offender: string | null = null;
        for (const t of call.turns) {
            if (t.role === 'narrateur' && has(t.text, w)) narratorSaid = true;
            if (t.role === 'loomina' && has(t.text, w) && !narratorSaid) { offender = t.text; break; }
        }
        checks.push({ ok: !offender, gravite: 'bloquant', domaine: 'direct', label: `Loomina n'aborde pas d'elle-même « ${w} »${offender ? ` — elle a dit : « ${offender.slice(0, 120)} »` : ''}` });
    }
    for (const w of attendu.loominaSans ?? []) {
        const offender = all.find((t) => has(t, w));
        checks.push({ ok: !offender, gravite: 'important', domaine: 'direct', label: `Loomina ne dit jamais « ${w} »${offender ? ` — elle a dit : « ${offender.slice(0, 120)} »` : ''}` });
    }

    if (tutoiement && replies.length >= 3) {
        const tu = TU;
        const vous = VOUS;
        // Après le moment où la préférence est connue : les trois premières répliques sont exclues si elle se décide pendant l'appel.
        const scope = attendu.profilTu ? replies.slice(3) : replies;
        const wrong = scope.filter((r) => (tutoiement === 'tu' ? vous.test(r.text) && !tu.test(r.text) : tu.test(r.text) && !vous.test(r.text))).length;
        checks.push({ ok: wrong === 0, gravite: 'important', domaine: 'direct', label: `${tutoiement === 'tu' ? 'tutoiement' : 'vouvoiement'} tenu (${wrong} réplique(s) à l'envers)` });
    }

    if (attendu.partNarrateurMin !== undefined) {
        checks.push({ ok: stats.partNarrateur >= attendu.partNarrateurMin, gravite: 'mineur', domaine: 'direct', label: `le narrateur parle ${pct(narratorWords, narratorWords + loominaWords)} % du temps (attendu au moins ${Math.round(attendu.partNarrateurMin * 100)} %)` });
    }
    if (attendu.fin) {
        checks.push({ ok: attendu.fin.includes(call.endedBy as never), gravite: 'important', domaine: 'direct', label: `fin d'appel : ${call.endedBy} (attendu ${attendu.fin.join(' ou ')})` });
    }
    return { checks, stats };
}

/** Ce que l'appel a laissé en base, comparé à l'état d'avant. */
export function dbChecks(params: {
    before: Snapshot;
    after: Snapshot;
    processed: Processed | null;
    call: CallResult;
    attendu: Expectation;
}): Check[] {
    const { before, after, processed, call, attendu } = params;
    const checks: Check[] = [];
    const B = (ok: boolean, label: string, gravite: Gravite = 'bloquant', domaine: Check['domaine'] = 'base') => checks.push({ ok, label, gravite, domaine });

    const event = after.events.find((e) => e.vapi_call_id === call.callSid);
    B(Boolean(event), 'le rapport de fin d\'appel est archivé dans call_events');
    B(Boolean(processed) && !processed?.error, `le traitement de fin d'appel aboutit${processed?.error ? ` — erreur : ${processed.error.slice(0, 200)}` : processed ? ` (${Math.round(processed.ms / 1000)} s)` : ' — rien après 5 minutes'}`);
    if (!event || !processed?.outcome) return checks;

    const issue = processed.outcome.status;
    if (attendu.issue) B(attendu.issue.includes(issue as never), `issue « ${issue} » (attendu ${attendu.issue.join(' ou ')})`, 'important');
    B(event.status === (issue === 'too_short' ? 'skipped' : 'done') && event.attempts === 1, `événement en « ${event.status} » après ${event.attempts} essai(s)`);

    const interviews = after.interviews.filter((i) => i.call_event_id === event.id);
    B(interviews.length === 1, `un seul entretien pour cet appel (${interviews.length})`);
    const interview = interviews[0];
    if (!interview) return checks;
    B(interview.processing_status === (issue === 'too_short' ? 'too_short' : 'processed'), `entretien en « ${interview.processing_status} »`);
    B(Boolean(interview.transcript) && call.turns.filter((t) => t.role === 'narrateur').every((t) => interview.transcript.includes(t.text.slice(0, 40))), 'le transcript enregistré contient tout ce que le narrateur a dit', 'important');

    const newChapters = after.chapters.filter((c) => !before.chapters.some((b) => b.id === c.id));
    const expectedChapters = issue === 'processed' ? 1 : 0;
    B(newChapters.length === expectedChapters, `${newChapters.length} chapitre écrit (attendu ${expectedChapters})`);
    const numbers = after.chapters.map((c) => c.chapter_number);
    B(numbers.every((n, i) => n === i + 1), `chapitres numérotés sans trou ni doublon (${numbers.join(', ') || 'aucun'})`);

    if (issue === 'too_short') {
        B(JSON.stringify(before.project.context) === JSON.stringify(after.project.context) && before.project.phase === after.project.phase && before.project.phase_progress === after.project.phase_progress && before.project.next_question_strategy === after.project.next_question_strategy, 'appel trop court : mémoire, phase et question suivante inchangées');
        return checks;
    }

    const log = interview.ai_analysis_log ?? {};
    const chapter = newChapters[0];
    if (chapter) {
        B(chapter.latest_interview_id === interview.id, 'le chapitre est rattaché à son entretien');
        B(Boolean(chapter.title?.trim()) && chapter.title !== 'Attente', `le chapitre a un titre (« ${chapter.title} »)`, 'important', 'chapitre');
        B(chapter.word_count === countWords(chapter.content_markdown), `nombre de mots enregistré exact (${chapter.word_count})`, 'mineur');
        B(chapter.phase === before.project.phase, `chapitre rangé dans la phase de l'appel (${chapter.phase})`, 'important');
        const expectedRange = log.chapter_material === 'thin' ? [20, 260] : [250, 2200];
        B(chapter.word_count >= expectedRange[0] && chapter.word_count <= expectedRange[1], `longueur cohérente avec la matière « ${log.chapter_material} » (${chapter.word_count} mots)`, 'important', 'chapitre');
        B(!/^#\s/m.test(chapter.content_markdown) && !/\b(le client|la cliente|le narrateur|la narratrice)\b/i.test(chapter.content_markdown), 'pas de titre de niveau 1 ni de « le client » dans le texte', 'important', 'chapitre');
        for (const w of attendu.chapitreContient ?? []) B(has(chapter.content_markdown, w), `le chapitre contient « ${w} »`, 'important', 'chapitre');
        for (const w of attendu.chapitreSans ?? []) B(!has(chapter.content_markdown, w) && !has(chapter.title ?? '', w), `le chapitre ne contient pas « ${w} »`, 'bloquant', 'chapitre');
    }

    // Phase : jamais en arrière, un cran au plus, et seulement à 100 %.
    const pb = before.project.phase;
    const pa = after.project.phase;
    B(pa === pb || (pa === pb + 1 && log.progress >= 100), `phase ${pb} → ${pa}, progression ${before.project.phase_progress} % → ${log.progress} %`);
    B(after.project.phase_progress === log.progress, 'la progression en base est celle de l\'analyse', 'mineur');
    if (pa === pb) B(log.progress >= (before.project.phase_progress ?? 0) - 15, `la progression ne recule pas franchement (${before.project.phase_progress} % → ${log.progress} %)`, 'important');

    // Question suivante.
    const q = after.project.next_question_strategy ?? '';
    B(q.trim().length > 20, 'une question est prête pour le prochain appel', 'important', 'memoire');
    B((q.match(/\?/g) ?? []).length <= 1, `la question suivante est une seule question — « ${q.slice(0, 220)} »`, 'important', 'memoire');
    for (const w of attendu.questionSans ?? []) B(!has(q, w), `la question suivante évite « ${w} »`, 'bloquant', 'memoire');
    const tu = after.profile.politeness_preference === 'tu';
    B(tu ? !VOUS.test(q) : !TU.test(q), `la question suivante ${tu ? 'tutoie' : 'vouvoie'}`, 'important', 'memoire');

    // Mémoire.
    const ctxBefore = normalizeContext(before.project.context);
    const ctx = normalizeContext(after.project.context);
    const memory = renderContext(ctx);
    // Sans les corrections de l'auteur, qui citent par nature la graphie fautive.
    const facts = renderContext({ ...ctx, author_corrections: [] });
    B(Boolean(ctx.last_call?.summary), 'la mémoire contient le résumé du dernier appel', 'important', 'memoire');
    B(memory.length < 9000, `la mémoire reste d'une taille raisonnable (${memory.length} caractères)`, 'mineur', 'memoire');
    for (const w of attendu.memoireContient ?? []) B(has(memory, w), `la mémoire contient « ${w} »`, 'important', 'memoire');
    for (const w of attendu.memoireSans ?? []) B(!has(facts, w), `la mémoire ne contient pas « ${w} »`, 'important', 'memoire');
    for (const y of attendu.anneesInterdites ?? []) B(!ctx.timeline.some((t) => t.year === y), `pas d'année ${y} devinée dans la chronologie`, 'important', 'memoire');
    for (const t of ctxBefore.timeline.filter((t) => t.year)) {
        if (!ctx.timeline.some((x) => x.year === t.year) && !memory.includes(String(t.year))) B(false, `repère perdu : ${t.year} (${t.event.slice(0, 60)})`, 'important', 'memoire');
    }
    B((ctx.author_corrections ?? []).length >= (ctxBefore.author_corrections ?? []).length, 'les corrections de l\'auteur sont conservées', 'bloquant', 'memoire');
    for (const s of attendu.suggestionsTraitees ?? []) B(!(ctx.suggested_topics ?? []).some((t) => has(t, s)), `sujet suggéré « ${s} » traité et retiré`, 'important', 'memoire');
    for (const s of attendu.suggestionsGardees ?? []) B((ctx.suggested_topics ?? []).some((t) => has(t, s)), `sujet suggéré « ${s} » gardé pour plus tard`, 'important', 'memoire');

    // Profil.
    if (attendu.profilTu) B(after.profile.politeness_preference === 'tu', `tutoiement retenu dans le profil (« ${after.profile.politeness_preference} »)`, 'important');
    else B(after.profile.politeness_preference === before.profile.politeness_preference, 'préférence tu/vous inchangée', 'important');
    for (const w of attendu.sensiblesAppris ?? []) B(has(after.profile.sensitive_topics ?? '', w), `sujet à éviter retenu : « ${w} » (profil : « ${after.profile.sensitive_topics ?? ''} »)`, 'bloquant');
    if (before.profile.sensitive_topics) B(has(after.profile.sensitive_topics ?? '', before.profile.sensitive_topics.split(',')[0].trim()), 'les sujets sensibles déjà connus sont conservés');

    // Proches.
    const names = after.family.map((f) => String(f.full_name).trim().toLowerCase());
    B(new Set(names).size === names.length, `aucun proche en double dans family_members (${names.length})`, 'important');
    const first = (n: string) => n.split(/\s+/)[0];
    const near = names.filter((n, i) => names.some((m, j) => j !== i && first(m) === first(n) && m !== n));
    if (near.length) B(false, `proches peut-être en double sous deux graphies : ${[...new Set(near)].join(', ')}`, 'mineur');

    B(interview.duration_seconds !== null && Math.abs(interview.duration_seconds - call.seconds) <= 20, `durée enregistrée (${interview.duration_seconds} s)`, 'mineur');
    return checks;
}
