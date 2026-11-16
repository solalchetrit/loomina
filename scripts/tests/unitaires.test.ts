/**
 * Tests unitaires : les règles décidées par le code, sans appel à un modèle.
 * Gratuits et instantanés : `npm run test:unitaires`.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { stepPhase, mergeTopics, coverage, readPhaseState, readTopics, openTopics, pendingAxes, PHASE_AXES } from '../../lib/loomina/phase-plan';
import type { PhaseState, Topic } from '../../lib/loomina/phase-plan';
import { toPhase } from '../../lib/loomina/phases';
import { remainingSuggestions, normalizeContext } from '../../lib/loomina/context';
import { phoneVariants } from '../../lib/loomina/db';
import { countWords, renderPreviousChapters } from '../../lib/loomina/writer';
import { buildAssistant } from '../../lib/loomina/assistant';
import type { Profile, Project } from '../../lib/loomina/db';

const empty = (phase: 1 | 2 | 3 | 4): PhaseState => ({ phase, covered: [], skipped: [], check: null });
const all = (phase: 1 | 2 | 3 | 4) => PHASE_AXES[phase].map((a) => a.key);

test('une phase incomplète ne propose pas de passer à la suite', () => {
    const s = stepPhase(empty(2), { covered: ['maison', 'ecole'] }, 'none');
    assert.equal(s.nextPhase, 2);
    assert.equal(s.state.check, null);
    assert.equal(s.progress, 40);
});

test('un sujet coché le reste, même si le modèle ne le renvoie plus', () => {
    const s = stepPhase({ ...empty(2), covered: ['maison'] }, { covered: ['ecole'] }, 'none');
    assert.deepEqual(s.state.covered.sort(), ['ecole', 'maison']);
});

test('tous les sujets couverts : la question est à poser, la phase ne change pas', () => {
    const s = stepPhase(empty(2), { covered: all(2) }, 'none');
    assert.equal(s.nextPhase, 2);
    assert.equal(s.state.check, 'to_ask');
    assert.equal(s.progress, 100);
});

test('le modèle ne peut pas faire avancer la phase sans que la question ait été posée', () => {
    const s = stepPhase(empty(2), { covered: all(2) }, 'advance');
    assert.equal(s.nextPhase, 2);
});

test('« on passe à la suite » fait avancer et repart de zéro', () => {
    const s = stepPhase({ ...empty(2), covered: all(2), check: 'to_ask' }, {}, 'advance');
    assert.equal(s.nextPhase, 3);
    assert.deepEqual(s.state, empty(3));
    assert.equal(s.completed, false);
});

test('« j\'ai encore des choses à dire » : on reste, et la question attend un appel', () => {
    const stay = stepPhase({ ...empty(2), covered: all(2), check: 'to_ask' }, {}, 'stay');
    assert.equal(stay.nextPhase, 2);
    assert.equal(stay.state.check, 'wait');
    const after = stepPhase(stay.state, {}, 'none');
    assert.equal(after.state.check, 'to_ask');
});

test('question sans réponse (appel coupé) : elle reste à poser', () => {
    const s = stepPhase({ ...empty(3), covered: all(3), check: 'to_ask' }, {}, 'none');
    assert.equal(s.state.check, 'to_ask');
    assert.equal(s.nextPhase, 3);
});

test('phase 4 : « le livre est complet » termine le livre sans changer de phase', () => {
    const s = stepPhase({ ...empty(4), covered: all(4), check: 'to_ask' }, {}, 'advance');
    assert.equal(s.completed, true);
    assert.equal(s.nextPhase, 4);
});

test('un sujet sans objet ne bloque pas la phase', () => {
    const s = stepPhase(empty(3), { covered: ['metier', 'lieux_adulte', 'passions', 'epreuves'], skipped: ['couple'] }, 'none');
    assert.equal(s.state.check, 'to_ask');
    assert.equal(s.progress, 100);
});

test('un sujet finalement raconté n\'est plus sans objet', () => {
    const s = stepPhase({ ...empty(3), skipped: ['couple'] }, { covered: ['couple'] }, 'none');
    assert.deepEqual(s.state.skipped, []);
    assert.deepEqual(s.state.covered, ['couple']);
});

test('un sujet propre encore ouvert empêche de proposer la suite', () => {
    const topics: Topic[] = [{ id: 1, phase: 3, label: 'La crêperie', status: 'open' }];
    const s = stepPhase(empty(3), { covered: all(3) }, 'none', topics);
    assert.equal(s.state.check, null);
    assert.equal(s.progress, 83);
    const done = stepPhase(empty(3), { covered: all(3) }, 'none', [{ ...topics[0], status: 'done' }]);
    assert.equal(done.state.check, 'to_ask');
});

test('un sujet évoqué en phase 1 est gardé pour la phase 3', () => {
    const topics = mergeTopics([], { add: [{ phase: 3, label: 'La crêperie La Houle à Cancale' }] });
    assert.equal(topics.length, 1);
    assert.equal(topics[0].phase, 3);
    assert.equal(topics[0].status, 'open');
    assert.equal(openTopics(topics, 1).length, 0);
    assert.equal(openTopics(topics, 3).length, 1);
});

test('pas de doublon de sujet, pas de sujet en phase 1, pas de sujet vide', () => {
    const first = mergeTopics([], { add: [{ phase: 3, label: 'La crêperie à Cancale' }] });
    const again = mergeTopics(first, { add: [{ phase: 3, label: 'la creperie a cancale' }, { phase: 1, label: 'Sa naissance' }, { phase: 2, label: '  ' }, { phase: 9, label: 'x' }] });
    assert.equal(again.length, 1);
});

test('un sujet raconté ou refusé le reste', () => {
    const base: Topic[] = [{ id: 1, phase: 3, label: 'A', status: 'open' }, { id: 2, phase: 3, label: 'B', status: 'open' }];
    const t = mergeTopics(base, { done: [1], skip: [2] });
    assert.deepEqual(t.map((x) => x.status), ['done', 'skip']);
    const later = mergeTopics(t, { skip: [1], done: [2] });
    assert.deepEqual(later.map((x) => x.status), ['done', 'skip']);
});

test('lecture tolérante de l\'état enregistré', () => {
    assert.deepEqual(readPhaseState(null, 2), empty(2));
    assert.deepEqual(readPhaseState({ phase_state: { phase: 1, covered: ['identite'], check: 'to_ask' } }, 2), empty(2));
    const s = readPhaseState({ phase_state: { phase: 2, covered: ['maison', 'inconnu', 'maison'], skipped: 'x', check: 'bizarre' } }, 2);
    assert.deepEqual(s, { phase: 2, covered: ['maison'], skipped: [], check: null });
    assert.deepEqual(readTopics({ book_topics: [{ id: 1, phase: 3, label: 'A' }, { id: 'x', phase: 3, label: 'B' }, null] }), [{ id: 1, phase: 3, label: 'A', status: 'open' }]);
    assert.equal(pendingAxes({ ...empty(3), covered: ['metier'], skipped: ['couple'] }).length, 3);
    assert.equal(coverage(1, { covered: [], skipped: [] }), 0);
});

test('phases héritées', () => {
    assert.equal(toPhase("Vue d'Ensemble"), 1);
    assert.equal(toPhase('3'), 3);
    assert.equal(toPhase(7), 1);
    assert.equal(toPhase('completed'), 4);
});

test('sujets suggérés : seuls ceux traités sont retirés, les nouveaux restent', () => {
    assert.deepEqual(remainingSuggestions(['A', 'B'], [1], ['A', 'B', 'C']), ['B', 'C']);
    assert.deepEqual(remainingSuggestions(['A'], [5], ['A']), ['A']);
});

test('mémoire : une sortie de modèle malformée ne casse rien', () => {
    const c = normalizeContext({ timeline: [{ year: 'x', event: 'né' }, { year: 1950 }, null], family: 'non', identity: 3 });
    assert.equal(c.timeline.length, 1);
    assert.equal(c.timeline[0].year, null);
    assert.deepEqual(c.family, []);
});

test('numéros de téléphone : toutes les écritures se retrouvent', () => {
    assert.ok(phoneVariants('+33781311298').includes('0781311298'));
    assert.ok(phoneVariants('07 81 31 12 98').includes('+33781311298'));
    assert.deepEqual(phoneVariants(''), []);
});

test('Écrivain : tous les chapitres précédents sont transmis, les plus anciens raccourcis au-delà du budget', () => {
    assert.equal(countWords('Un **deux** trois'), 3);
    const few = renderPreviousChapters([{ chapter_number: 1, title: 'A', content_markdown: 'x'.repeat(5000) }, { chapter_number: 2, title: 'B', content_markdown: 'y'.repeat(5000) }]);
    assert.ok(few.length > 10000);
    const many = renderPreviousChapters(Array.from({ length: 30 }, (_, i) => ({ chapter_number: i + 1, title: `C${i}`, content_markdown: 'z'.repeat(8000) })));
    assert.ok(many.length < 100_000);
    assert.ok(many.includes('Chapitre 30'));
});

const profile = { id: 'p', first_name: 'Jeanne', first_name_phonetic: null, last_name: 'Morel', full_name: 'Jeanne Morel', email: null, phone_number: null, politeness_preference: 'vous', writing_style: null, sensitive_topics: 'son frère' } as Profile;
const project = (extra: Partial<Project>): Project => ({ id: 'x', user_id: 'p', title: null, status: 'active', phase: 2, phase_progress: 0, current_topic_id: null, context: { identity: { full_name: 'Jeanne Morel' }, last_call: { summary: 'La maison.' } }, next_question_strategy: 'Racontez-moi votre école.', project_metadata: {}, global_context: null, ...extra }) as Project;
const prompt = (p: Project) => buildAssistant({ profile, project: p, prompt: null, phase: toPhase(p.phase), serverUrl: 'x' }).assistant.model.messages[0].content;

test('voix : le point sur la phase remplace la question d\'ouverture', () => {
    const normal = prompt(project({}));
    assert.ok(normal.includes('Racontez-moi votre école.'));
    assert.ok(!normal.includes('FAIRE LE POINT'));
    const check = prompt(project({ project_metadata: { phase_state: { phase: 2, covered: all(2), skipped: [], check: 'to_ask' } } }));
    assert.ok(check.includes('FAIRE LE POINT'));
    assert.ok(check.includes("on passe à votre vie d'adulte"));
    assert.ok(!check.includes('Racontez-moi votre école.'));
});

test('voix : sujets propres de la phase en cours seulement, et sujets dont on ne sait rien', () => {
    const p = prompt(project({ phase: 3, project_metadata: { phase_state: { phase: 3, covered: ['metier'], skipped: ['couple'], check: null }, book_topics: [{ id: 1, phase: 3, label: 'La crêperie La Houle', status: 'open' }, { id: 2, phase: 4, label: 'La chorale', status: 'open' }, { id: 3, phase: 3, label: 'Le voilier', status: 'done' }] } }));
    assert.ok(p.includes('La crêperie La Houle'));
    assert.ok(!p.includes('La chorale'));
    assert.ok(!p.includes('Le voilier'));
    assert.ok(p.includes('CE DONT ON NE SAIT ENCORE RIEN'));
    assert.ok(p.includes('Les passions, les voyages'));
    assert.ok(!p.includes('La vie affective et familiale : les personnes aimées'));
});

test('voix : règles toujours présentes (une question, sujets sensibles, ne rien présumer)', () => {
    const p = prompt(project({}));
    assert.ok(p.includes('UN SEUL point d\'interrogation'));
    assert.ok(p.includes('son frère'));
    assert.ok(p.includes('Ne présume jamais d\'une vie'));
    assert.ok(p.includes('Loumina'));
});
