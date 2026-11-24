/**
 * Tests unitaires : les règles décidées par le code, sans appel à un modèle.
 * Gratuits et instantanés : `npm run test:unitaires`.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
    stepPhase,
    mergeTopics,
    coverage,
    readPhaseState,
    readTopics,
    openTopics,
    pendingAxes,
    PHASE_AXES,
    mergeTold,
    readTold,
    axesCoveredByScenes,
    mergeDeepen,
    openDeepen,
    mergeWishes,
    readWishes,
    shallowAxes,
    untouchedAxes,
    axisDepth,
} from '../../lib/loomina/phase-plan';
import type { PhaseState, Topic, ToldScene } from '../../lib/loomina/phase-plan';
import { applyPolish, chapterSignature, renderBook } from '../../lib/loomina/book';
import { bookTitle } from '../../lib/loomina/book-print';
import { toPhase } from '../../lib/loomina/phases';
import { remainingSuggestions, normalizeContext } from '../../lib/loomina/context';
import { phoneVariants } from '../../lib/loomina/db';
import { countWords, renderPreviousChapters } from '../../lib/loomina/writer';
import { buildAssistant } from '../../lib/loomina/assistant';
import type { Profile, Project } from '../../lib/loomina/db';
import { normalizeCallMinutes, timeNote, hardLimitSeconds, DEFAULT_CALL_MINUTES } from '../../lib/loomina/call-length';

const empty = (phase: 1 | 2 | 3 | 4): PhaseState => ({ phase, covered: [], skipped: [], check: null });
const all = (phase: 1 | 2 | 3 | 4) => PHASE_AXES[phase].map((a) => a.key);

test('une phase incomplète ne propose pas de passer à la suite', () => {
    const s = stepPhase(empty(2), { covered: ['maison', 'ecole'] }, 'none');
    assert.equal(s.nextPhase, 2);
    assert.equal(s.state.check, null);
    assert.equal(s.progress, 29); // 2 sujets sur 7
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
    const s = stepPhase(empty(3), { covered: all(3).filter((k) => k !== 'couple'), skipped: ['couple'] }, 'none');
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
    assert.equal(s.progress, 90); // 9 sujets sur 10
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
    assert.equal(pendingAxes({ ...empty(3), covered: ['metier'], skipped: ['couple'] }).length, PHASE_AXES[3].length - 2);
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
    assert.ok(p.includes('Les passions, les activités, les voyages'));
    assert.ok(!p.includes('La vie affective : les personnes aimées'));
});

// ------------------------------------------------------------
// Scènes racontées, scènes à approfondir, souhaits pour le livre (19/11/2026)
// ------------------------------------------------------------

const scenes = (axis: string, n: number, from = 0): ToldScene[] => Array.from({ length: n }, (_, i) => ({ axis, what: `Scène ${axis} ${from + i + 1}` }));

test('scènes : une seule scène ne suffit plus à cocher un sujet des phases 2 et 3', () => {
    assert.equal(axisDepth('maison'), 3);
    assert.deepEqual(axesCoveredByScenes(2, scenes('maison', 1), []), []);
    assert.deepEqual(axesCoveredByScenes(2, scenes('maison', 2), []), []);
    assert.deepEqual(axesCoveredByScenes(2, scenes('maison', 3), []), ['maison']);
    // Les sujets où l'on n'insiste pas se cochent plus tôt.
    assert.deepEqual(axesCoveredByScenes(3, scenes('epreuves', 1), []), ['epreuves']);
    assert.deepEqual(axesCoveredByScenes(3, scenes('amis', 2), []), ['amis']);
});

test('scènes : un narrateur qui a tout dit sur un sujet n\'est pas bloqué', () => {
    assert.deepEqual(axesCoveredByScenes(2, scenes('ecole', 1), ['ecole', 'inconnu']), ['ecole']);
});

test('scènes : pas de doublon, sujet inconnu gardé sans compter, entrées malformées ignorées', () => {
    const first = mergeTold([], [{ axis: 'maison', what: 'La cuisine de la ferme' }, { axis: 'maison', what: 'la cuisine de la ferme' }, { axis: 'pas_un_sujet', what: 'Le chien Pataud' }, { what: '' }, null, 'x']);
    assert.equal(first.length, 2);
    assert.deepEqual(axesCoveredByScenes(2, first, []), []);
    const again = mergeTold(first, [{ axis: 'maison', what: 'La cuisine de la ferme' }, { axis: 'maison', what: 'Le grenier' }]);
    assert.equal(again.length, 3);
    assert.deepEqual(readTold({ book_told: again }), again);
    assert.deepEqual(readTold({ book_told: 'x' }), []);
});

test('scènes : l\'avancement compte un sujet entamé pour sa part, et ne dit 100 % que si tout est couvert', () => {
    const none = coverage(2, { covered: [], skipped: [] }, [], []);
    const one = coverage(2, { covered: [], skipped: [] }, [], scenes('maison', 1));
    const two = coverage(2, { covered: [], skipped: [] }, [], scenes('maison', 2));
    assert.equal(none, 0);
    assert.ok(one > none && two > one);
    // Toutes les scènes y sont, mais le code n'a pas encore coché : jamais 100 par arrondi.
    const full = PHASE_AXES[2].flatMap((a) => scenes(a.key, 3));
    assert.equal(coverage(2, { covered: [], skipped: [] }, [], full), 99);
    assert.equal(coverage(2, { covered: all(2), skipped: [] }, [], full), 100);
});

test('scènes : un appel riche fait avancer la phase par les scènes, pas par l\'avis du modèle', () => {
    const told = PHASE_AXES[2].flatMap((a) => scenes(a.key, axisDepth(a.key)));
    const covered = axesCoveredByScenes(2, told, []);
    assert.deepEqual(covered, all(2));
    const s = stepPhase(empty(2), { covered }, 'none', [], told);
    assert.equal(s.state.check, 'to_ask');
    assert.equal(s.progress, 100);
});

test('voix : sujets entamés à enrichir, sujets vierges, et ce qui est déjà raconté', () => {
    const state = { ...empty(2) };
    const told = [...scenes('maison', 1), ...scenes('ecole', 3)];
    assert.deepEqual(shallowAxes(state, told).map((a) => a.key), ['maison']);
    assert.ok(!untouchedAxes(state, told).some((a) => a.key === 'maison' || a.key === 'ecole'));
    const p = prompt(
        project({
            project_metadata: {
                phase_state: { phase: 2, covered: ['ecole'], skipped: [], check: null },
                book_told: [{ axis: 'maison', what: 'La cuisine de la ferme à Sébazac' }],
                book_deepen: [{ id: 1, label: 'Le jour où le père a vendu les bêtes, dit en une phrase', status: 'open' }, { id: 2, label: 'Le bal du 14 juillet', status: 'done' }],
            },
        })
    );
    assert.ok(p.includes('SCÈNES FORTES À APPROFONDIR'));
    assert.ok(p.includes('Le jour où le père a vendu les bêtes'));
    assert.ok(!p.includes('Le bal du 14 juillet'));
    assert.ok(p.includes('SUJETS ENTAMÉS, À ENRICHIR'));
    assert.ok(p.includes('CE QUI EST DÉJÀ RACONTÉ'));
    assert.ok(p.includes('La cuisine de la ferme à Sébazac'));
    assert.ok(p.includes('CREUSER COMME UN BIOGRAPHE'));
});

test('voix : au premier appel, aucun de ces blocs', () => {
    const p = prompt(project({ phase: 1, context: {}, next_question_strategy: null, project_metadata: {} }));
    assert.ok(!p.includes('SCÈNES FORTES À APPROFONDIR'));
    assert.ok(!p.includes('CE QUI EST DÉJÀ RACONTÉ'));
});

test('scènes à approfondir : trois au plus par appel, pas de doublon, une scène approfondie le reste', () => {
    const first = mergeDeepen([], { add: ['A la gare', 'B le bal', 'C la ferme', 'D de trop', 'a la gare'] });
    assert.deepEqual(first.map((d) => d.label), ['A la gare', 'B le bal', 'C la ferme']);
    const later = mergeDeepen(first, { done: [1], add: ['A la gare'] });
    assert.deepEqual(openDeepen(later).map((d) => d.id), [2, 3]);
    assert.equal(openDeepen(mergeDeepen(later, {})).length, 2);
});

test('souhaits pour le livre : gardés avec les mots de la personne, jamais effacés par un champ vide', () => {
    const w = mergeWishes({}, { title: ' La 2 CV jaune ', dedication: 'À mes petits-enfants', thanks: '', ending: 'null' });
    assert.deepEqual(w, { title: 'La 2 CV jaune', dedication: 'À mes petits-enfants' });
    assert.deepEqual(mergeWishes(w, { title: '', thanks: 'Merci à Paulette' }), { ...w, thanks: 'Merci à Paulette' });
    assert.deepEqual(readWishes({ book_wishes: w }), w);
    assert.deepEqual(readWishes(null), {});
});

// ------------------------------------------------------------
// Le livre : relecture finale, chapitres repris, pièces (lib/loomina/book.ts)
// ------------------------------------------------------------

test('relecture du livre : une retouche s\'applique seulement si le passage est unique, et jamais sur une citation', () => {
    const chapters = [
        { content: 'Ma mère disait toujours « on ne gaspille pas le pain ». La maison sentait la soupe et le feu de bois.' },
        { content: 'La maison sentait la soupe et le feu de bois. Nous partions à pied à l\'école, et le chemin était long. Et le chemin était long.' },
    ];
    const done = applyPolish(chapters, [
        // Une redite retirée du second chapitre.
        { chapter: 2, find: 'La maison sentait la soupe et le feu de bois. ', replace: '', why: 'redite' },
        // Passage introuvable : ignoré.
        { chapter: 1, find: 'Un passage qui n\'existe pas du tout', replace: 'x', why: '' },
        // Citation modifiée : refusée.
        { chapter: 1, find: 'Ma mère disait toujours « on ne gaspille pas le pain ».', replace: 'Ma mère disait toujours « ne gaspille pas ».', why: '' },
        // Remplacement nettement plus long : refusé (une retouche n'écrit pas).
        { chapter: 1, find: 'La maison sentait la soupe', replace: 'La maison sentait la soupe' + ', et mille autres choses inventées'.repeat(4), why: '' },
        // Chapitre inexistant : ignoré.
        { chapter: 9, find: 'La maison sentait la soupe', replace: '', why: '' },
    ]);
    assert.equal(done.applied, 1);
    assert.equal(done.chapters[0].content, chapters[0].content);
    assert.ok(done.chapters[1].content.startsWith('Nous partions à pied'));
    // L'original n'est pas modifié.
    assert.ok(chapters[1].content.startsWith('La maison'));
    // Un chapitre repris de l'édition précédente (déjà lu par l'auteur) n'est jamais retouché.
    const locked = applyPolish(chapters, [{ chapter: 2, find: 'La maison sentait la soupe et le feu de bois. ', replace: '', why: 'redite' }], [2]);
    assert.equal(locked.applied, 0);
    assert.equal(locked.chapters[1].content, chapters[1].content);
});

test('livre : un chapitre dont les scènes n\'ont pas changé garde la même empreinte', () => {
    const a = { title: 'La ferme de Sébazac', part: 'L’enfance', summary: 'x', scenes: [{ what: 'Les moissons', sources: [2, 1] }] };
    const same = { title: 'La ferme de sébazac ', part: 'Autre partie', summary: 'y', scenes: [{ what: 'les moissons', sources: [1, 2] }] };
    const more = { ...a, scenes: [...a.scenes, { what: 'Le chien Pataud', sources: [3] }] };
    assert.equal(chapterSignature(a), chapterSignature(same));
    assert.notEqual(chapterSignature(a), chapterSignature(more));
});

test('livre : les pièces entourent les chapitres, et les intertitres descendent d\'un cran', () => {
    const text = renderBook({
        chapters: [{ number: 1, title: 'La ferme', part: 'L’enfance', content: '## La cuisine\n\nTexte.', sources: [1], words: 1 }],
        plan: [],
        dropped: [],
        source_count: 1,
        model: 'x',
        at: 'x',
        pieces: { title: 'La 2 CV jaune', subtitle: null, dedication: 'À mes petits-enfants', preface: 'Suzanne est née à Rodez.', thanks: null, back_cover: null },
    } as never);
    assert.ok(text.startsWith('# La 2 CV jaune'));
    assert.ok(text.indexOf('À mes petits-enfants') < text.indexOf('Avant-propos'));
    assert.ok(text.indexOf('Avant-propos') < text.indexOf('## La ferme'));
    assert.ok(text.includes('### La cuisine'));
    assert.ok(!text.includes('Remerciements'));
});

test('livre : le titre trouvé dans le livre remplace « Biographie de… », jamais un titre choisi', () => {
    assert.equal(bookTitle({ title: 'Biographie de Suzanne' }, 'Suzanne', 'La 2 CV jaune'), 'La 2 CV jaune');
    assert.equal(bookTitle({ title: 'Mon Livre de Vie' }, 'Suzanne', 'La 2 CV jaune'), 'La 2 CV jaune');
    assert.equal(bookTitle({ title: 'Chez Marguerite' }, 'Suzanne', 'La 2 CV jaune'), 'Chez Marguerite');
    assert.equal(bookTitle({ title: 'Biographie de Suzanne' }, 'Suzanne', null), 'Biographie de Suzanne');
    assert.equal(bookTitle(null, 'Suzanne'), 'Biographie de Suzanne');
});

test('voix : règles toujours présentes (une question, sujets sensibles, ne rien présumer)', () => {
    const p = prompt(project({}));
    assert.ok(p.includes('UN SEUL point d\'interrogation'));
    assert.ok(p.includes('son frère'));
    assert.ok(p.includes('Ne présume jamais d\'une vie'));
    assert.ok(p.includes('Loumina'));
});

// ------------------------------------------------------------
// Durée d'appel souhaitée (lib/loomina/call-length.ts)
// ------------------------------------------------------------

test('durée souhaitée : une valeur inconnue revient à 20 minutes', () => {
    assert.equal(normalizeCallMinutes(30), 30);
    assert.equal(normalizeCallMinutes('45'), 45);
    assert.equal(normalizeCallMinutes(7), DEFAULT_CALL_MINUTES);
    assert.equal(normalizeCallMinutes(undefined), DEFAULT_CALL_MINUTES);
});

test('durée souhaitée : avant le temps visé, Loomina ne propose pas d’arrêter', () => {
    const note = timeNote(8 * 60 + 30, 30);
    assert.match(note, /8 min écoulées sur environ 30 min/);
    assert.match(note, /ne propose pas d'arrêter/);
});

test('durée souhaitée : une fois le temps atteint, elle attend la fin du sujet', () => {
    const note = timeNote(31 * 60, 30);
    assert.match(note, /durée souhaitée est atteinte/);
    assert.match(note, /plus grand-chose à raconter sur ce sujet/);
    assert.doesNotMatch(note, /ne propose pas d'arrêter/);
});

test('durée souhaitée : le plafond est de 1 h 30, quelle que soit la durée souhaitée', () => {
    assert.equal(hardLimitSeconds(20, 2700), 90 * 60);
    assert.equal(hardLimitSeconds(45, 5400), 90 * 60);
});

// ---- Prévenir : bienvenue, famille ----
import { welcomeTexts, familyNewsText } from '../../lib/loomina/notify';

test('bienvenue : pour soi, le SMS part au narrateur et donne le numéro à appeler', () => {
    const w = welcomeTexts({ buyerEmail: 'a@b.fr', narratorFirstName: 'Jeanne', narratorPhone: '+33611111111', isGift: false, giver: null });
    assert.equal(w.smsTo, '+33611111111');
    assert.match(w.sms, /01 59 16 93 57/);
    assert.match(w.email, /Bonjour Jeanne,/);
});

test('bienvenue : livre offert, le SMS part à celui qui offre, jamais au narrateur', () => {
    const w = welcomeTexts({ buyerEmail: 'a@b.fr', narratorFirstName: 'Jeanne', narratorPhone: '+33611111111', isGift: true, giver: { first_name: 'Paul', phone: '+33622222222' } });
    assert.equal(w.smsTo, '+33622222222');
    assert.match(w.email, /Bonjour Paul,/);
    assert.match(w.email, /offrir à Jeanne/);
});

test('famille : les nouvelles ne contiennent jamais le texte du récit', () => {
    assert.match(familyNewsText('first_call', 'Jeanne').text, /premier appel/);
    assert.match(familyNewsText('new_story', 'Jeanne', 'La maison de Lyon').text, /« La maison de Lyon »/);
    assert.match(familyNewsText('book_complete', 'Jeanne').subject, /terminé/);
});

import { abandonedCartTexts } from '../../lib/loomina/notify';

test('panier abandonné : trois e-mails, le lien de reprise, sans SMS', () => {
    const cart = { email: 'a@b.fr', firstName: 'Paul', isGift: true, narratorFirstName: 'Jeanne', recoveryUrl: 'https://checkout.stripe.com/c/pay/abc' };
    const [one, two, three] = ([1, 2, 3] as const).map((step) => abandonedCartTexts(cart, step));
    for (const t of [one, two, three]) {
        assert.match(t.email, /https:\/\/checkout\.stripe\.com\/c\/pay\/abc/);
        assert.doesNotMatch(t.email, /pas une seconde fois/);
        assert.equal('sms' in t, false);
    }
    assert.match(one.subject, /Le livre de Jeanne/);
    assert.match(two.email, /Jeanne appelle Loomina/);
    assert.match(three.subject, /Dernier rappel/);
    assert.match(three.email, /dernier message/);
    const self = abandonedCartTexts({ email: 'a@b.fr', firstName: null, isGift: false, narratorFirstName: null, recoveryUrl: null }, 2);
    assert.match(self.email, /loomina\.eu\/order/);
    assert.match(self.email, /Vous appelez Loomina/);
});

test('panier abandonné : à l’expiration, deux jours puis cinq jours après, une seule suite par adresse', async () => {
    const { cartStepDue } = await import('../../lib/loomina/abandoned-cart');
    const H = 3600_000, D = 24 * H;
    const t0 = Date.UTC(2026, 10, 23, 10);
    const cart = (over: Partial<{ id: string; expires: number; meta: Record<string, string>; status: 'expired' | 'open' | 'complete' }> = {}) => ({
        id: over.id ?? 'cs_1',
        created: Math.floor(((over.expires ?? t0) - 2 * H) / 1000),
        expires_at: Math.floor((over.expires ?? t0) / 1000),
        status: over.status ?? ('expired' as const),
        metadata: { email: 'a@b.fr', ...(over.meta ?? {}) },
    });
    assert.equal(cartStepDue([cart()], t0), 1);
    // Le rattrapage laisse au webhook une demi-heure pour le premier e-mail.
    assert.equal(cartStepDue([cart()], t0 + 10 * 60_000, 30 * 60_000), null);
    const sent1 = { relances: '1', relance_at: new Date(t0).toISOString() };
    assert.equal(cartStepDue([cart({ meta: sent1 })], t0 + D), null);
    assert.equal(cartStepDue([cart({ meta: sent1 })], t0 + 2 * D), 2);
    const sent2 = { relances: '2', relance_at: new Date(t0 + 2 * D).toISOString() };
    assert.equal(cartStepDue([cart({ meta: sent2 })], t0 + 4 * D), null);
    assert.equal(cartStepDue([cart({ meta: sent2 })], t0 + 5 * D), 3);
    assert.equal(cartStepDue([cart({ meta: { relances: '3', relance_at: new Date(t0 + 5 * D).toISOString() } })], t0 + 7 * D), null);
    // Un second panier le lendemain ne relance pas la suite.
    assert.equal(cartStepDue([cart({ meta: sent1 }), cart({ id: 'cs_2', expires: t0 + D })], t0 + D + H), null);
    // En retard (serveur arrêté) : jamais deux e-mails à moins de 20 h.
    assert.equal(cartStepDue([cart({ meta: { relances: '2', relance_at: new Date(t0 + 5 * D - 2 * H).toISOString() } })], t0 + 5 * D), null);
    // Ancienne relance unique : son e-mail promettait de ne pas réécrire.
    assert.equal(cartStepDue([cart({ meta: { relance_sent: 'true' } })], t0 + 3 * D), null);
    // Changement de moyen de paiement : pas un panier.
    assert.equal(cartStepDue([cart({ meta: { superseded: 'true' } })], t0), null);
    // Au-delà de huit jours : fini.
    assert.equal(cartStepDue([cart()], t0 + 9 * D), null);
});

test('désinscription : une empreinte de l’adresse, jamais l’adresse, la même quelle que soit la casse', async () => {
    process.env.JWT_SECRET = process.env.JWT_SECRET || 'secret-de-test';
    const { optOutToken, optOutUrl, isOptOutToken, optOutHeaders } = await import('../../lib/loomina/optout');
    const t = optOutToken('Paul@Exemple.fr ')!;
    assert.equal(t, optOutToken('paul@exemple.fr'));
    assert.notEqual(t, optOutToken('jeanne@exemple.fr'));
    assert.ok(isOptOutToken(t));
    assert.doesNotMatch(optOutUrl('paul@exemple.fr')!, /paul|exemple/);
    assert.match(optOutHeaders('paul@exemple.fr')['List-Unsubscribe'], /\/api\/desinscription\?t=/);
});

test('relance automatique : après 14 jours sans appel, une fois par silence, jamais pour un test', async () => {
    const { autoRelanceDue } = await import('../../lib/admin/watch');
    const base = { health: 'inactif', test: false, lastCallAt: '2026-11-01T10:00:00Z', orderedAt: '2026-10-01T10:00:00Z', daysSinceLastCall: 15, daysSinceOrder: 45 };
    assert.equal(autoRelanceDue(base, {}), '2026-11-01T10:00:00Z');
    assert.equal(autoRelanceDue({ ...base, daysSinceLastCall: 14 }, {}), null);
    assert.equal(autoRelanceDue(base, { auto_relance: { since: '2026-11-01T10:00:00Z' } }), null);
    // Il a rappelé puis s'est tu à nouveau : nouvelle relance.
    assert.equal(autoRelanceDue(base, { auto_relance: { since: '2026-10-10T10:00:00Z' } }), '2026-11-01T10:00:00Z');
    assert.equal(autoRelanceDue({ ...base, test: true }, {}), null);
    assert.equal(autoRelanceDue(base, { refunded_at: '2026-11-02' }), null);
    // Jamais appelé : compté depuis la commande.
    const never = { ...base, health: 'relancer', lastCallAt: null, daysSinceLastCall: null };
    assert.equal(autoRelanceDue({ ...never, daysSinceOrder: 10 }, {}), null);
    assert.equal(autoRelanceDue({ ...never, daysSinceOrder: 15 }, {}), '2026-10-01T10:00:00Z');
});

test('relance d’un client : l’e-mail suit aussi le tutoiement', async () => {
    const { relanceTexts } = await import('../../lib/admin/actions');
    const tu = relanceTexts({ firstName: 'Léo', tu: true, toGiver: false, narrator: 'Léo' });
    assert.match(tu.email, /Ton livre t'attend/);
    assert.doesNotMatch(tu.email, /vous/i);
    assert.match(relanceTexts({ firstName: 'Jeanne', tu: false, toGiver: false, narrator: 'Jeanne' }).email, /Votre livre vous attend/);
});

test('démo : un récit en échec est retenté avec un délai croissant, cinq fois au plus, sur 24 h', async () => {
    const { demoAttempts, demoRetryDue } = await import('../../lib/loomina/demo-story');
    const at = (min: number) => new Date(Date.now() - min * 60_000).toISOString();
    assert.equal(demoAttempts(null), 0);
    assert.equal(demoAttempts('429 You have no credits remaining'), 1);
    assert.equal(demoAttempts('essai 3 : 429'), 3);
    assert.equal(demoRetryDue({ error: '429', created_at: at(2) }), false); // trop tôt
    assert.equal(demoRetryDue({ error: '429', created_at: at(31) }), true); // 2e essai après 30 min
    assert.equal(demoRetryDue({ error: 'essai 2 : 429', created_at: at(60) }), false); // 3e essai après 2 h
    assert.equal(demoRetryDue({ error: 'essai 2 : 429', created_at: at(125) }), true);
    assert.equal(demoRetryDue({ error: 'essai 5 : 429', created_at: at(800) }), false); // plus d'essai
    assert.equal(demoRetryDue({ error: 'essai 4 : 429', created_at: at(25 * 60) }), false); // plus de 24 h
});

// ───────── Mémo, l'éléphant de l'espace auteur ─────────

import { memoState } from '../../lib/loomina/memo';
import { buildWeave } from '../../lib/loomina/weave';

const memoWeave = (phase: 1 | 2 | 3 | 4, covered: string[], completed = false) =>
    buildWeave({ phase, completed, state: { covered, skipped: [] }, calls: 1, words: 0, photos: 0, hasTitle: false, hasSchedule: false });

test('Mémo : avant le premier appel, il est tout petit et il dort', () => {
    const m = memoState({ phase: 1, completed: false, weave: memoWeave(1, []), calls: [] });
    assert.equal(m.age, 1);
    assert.equal(m.mood, 'asleep');
});

test('Mémo : son âge suit l’étape du livre, et il compte les souvenirs qui restent dans l’étape', () => {
    const now = new Date('2026-11-19T12:00:00Z');
    const m = memoState({ phase: 3, completed: false, weave: memoWeave(3, ['metier', 'couple', 'enfants', 'passions']), calls: [{ date: '2026-11-12T10:00:00Z' }], now });
    assert.equal(m.age, 3);
    assert.equal(m.mood, 'steady');
    assert.equal(m.total - m.told, 5);
    assert.match(m.headline, /Encore 5 souvenirs et Mémo met ses lunettes/);
    assert.ok(m.path > 0.5 && m.path < 0.75);
});

test('Mémo : joyeux après un appel récent, il attend après deux semaines sans appel, jamais de reproche', () => {
    const now = new Date('2026-11-19T12:00:00Z');
    const w = memoWeave(2, ['heritage']);
    assert.equal(memoState({ phase: 2, completed: false, weave: w, calls: [{ date: '2026-11-18T18:00:00Z' }], now }).mood, 'fresh');
    const waiting = memoState({ phase: 2, completed: false, weave: w, calls: [{ date: '2026-10-20T18:00:00Z' }], now });
    assert.equal(waiting.mood, 'waiting');
    assert.doesNotMatch(`${waiting.headline} ${waiting.note}`, /retard|perdu|oubli[ée]/i);
});

test('Mémo : récit complet, il tient le livre', () => {
    const m = memoState({ phase: 4, completed: true, weave: memoWeave(4, [], true), calls: [{ date: '2026-11-01T10:00:00Z' }] });
    assert.equal(m.age, 5);
    assert.equal(m.mood, 'done');
    assert.equal(m.path, 1);
});

test('livre terminé : la voix annonce la fin, et l\'auteur reçoit SMS et e-mail avec le délai', async () => {
    const { phaseCheck } = await import('../../lib/loomina/assistant');
    const { bookCompleteTexts } = await import('../../lib/loomina/notify');
    const { PHASE_AXES } = await import('../../lib/loomina/phase-plan');
    const project = {
        id: 'p', user_id: 'u', title: null, status: 'active', phase: 4, context: {}, global_context: 'Jeanne a raconté son enfance à Rennes.',
        project_metadata: { prefs_set_at: 'x', phase_state: { phase: 4, covered: PHASE_AXES[4].map((a: { key: string }) => a.key), skipped: [], check: 'to_ask' } },
    } as never;
    const c = phaseCheck(project, { first_name: 'Jeanne', politeness_preference: 'vous' });
    assert.ok(c, 'pas de point à faire en fin de livre');
    assert.match(c.block, /son livre est terminé/);
    assert.match(c.block, /d'ici une semaine/);
    assert.match(c.block, /Dis au revoir/);
    for (const pref of ['vous', 'tu']) {
        const t = bookCompleteTexts({ first_name: 'Jeanne', politeness_preference: pref });
        assert.match(t.sms, /livre est terminé/);
        assert.match(t.sms, /une semaine/);
        assert.match(t.email, /première version complète/);
        assert.doesNotMatch(t.sms + t.email, /reli[ée]/);
    }
});

// ── Le livre après « terminé » (20/11/2026) ─────────────────────────────
test('étapes du livre : lecture, étape suivante, suivi La Poste par défaut', async () => {
    const { readFulfillment, nextTeamStep, parseTracking } = await import('../../lib/loomina/fulfillment');
    assert.equal(readFulfillment('active', { reviewed_at: '2026-11-20' }).stage, 'writing');
    assert.equal(readFulfillment('completed', {}).stage, 'completed');
    assert.equal(readFulfillment('completed', { reviewed_at: 'x', printed_at: 'y' }).stage, 'printing');
    assert.equal(nextTeamStep('completed'), 'reviewed');
    assert.equal(nextTeamStep('delivered'), null);
    const t = parseTracking(' 6A 1234 ', '');
    assert.equal(t?.number, '6A 1234');
    assert.match(t!.url, /laposte\.fr.*6A1234/);
    assert.equal(parseTracking('', 'https://x'), null);
});

test('étapes du livre : messages à l’auteur (tu/vous) et à la famille', async () => {
    const { bookStageTexts } = await import('../../lib/loomina/notify');
    const vous = bookStageTexts('reviewed', { first_name: 'Jeanne' }, null);
    assert.match(vous.sms, /votre livre est relu/);
    assert.doesNotMatch(vous.email, /relié/);
    const tu = bookStageTexts('printing', { first_name: 'Marc', politeness_preference: 'tu' }, null);
    assert.match(tu.sms, /ton livre est à l'impression/);
    const fam = bookStageTexts('shipped', { first_name: 'Claire', family: true, narratorFirstName: 'Jeanne' }, { number: 'AB1', url: 'https://suivi' });
    assert.match(fam.sms, /le livre de Jeanne est en route/);
    assert.match(fam.email, /AB1/);
});

test('clients de test : drapeau test ou banc', async () => {
    const { isTestMeta } = await import('../../lib/loomina/test-flag');
    assert.equal(isTestMeta({ test: true }), true);
    assert.equal(isTestMeta({ banc: true }), true);
    assert.equal(isTestMeta({ is_gift: true }), false);
    assert.equal(isTestMeta(null), false);
});

test('démo : une réponse coupée sans rien d’entendu disparaît, un bout entendu est marqué coupé', async () => {
    // Le serveur vocal lit sa configuration au chargement : valeurs factices.
    for (const k of ['PUBLIC_URL', 'NEXT_BASE_URL', 'VAPI_WEBHOOK_SECRET', 'TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN', 'TWILIO_PHONE_NUMBER', 'OPENAI_API_KEY']) process.env[k] ||= 'test';
    // Chemin en variable : le serveur vocal a son propre tsconfig, hors du site.
    const sessionModule = '../../voice/src/session.ts';
    const { CallSession } = (await import(sessionModule)) as { CallSession: new (init: unknown) => { onInterrupt(heard: string): void } };
    const s = new CallSession({ callSid: 'CAtest', from: '+33600000000', to: '+33159169357', direction: 'inbound', plan: { demo: true, metadata: {}, systemPrompt: 'x' } });
    const turns = (s as unknown as { turns: { role: string; message: string; cut?: boolean }[] }).turns;
    turns.push({ role: 'user', message: 'Le jour du foot avec mon cousin.' }, { role: 'bot', message: 'Racontez-moi ce jour-là. Où étiez-vous ?' });
    s.onInterrupt('');
    assert.equal(turns.length, 1);
    turns.push({ role: 'bot', message: 'Racontez-moi ce jour-là. Où étiez-vous ?' });
    s.onInterrupt('Racontez-moi ce jour-là.');
    assert.deepEqual(turns[1], { role: 'bot', message: 'Racontez-moi ce jour-là.', cut: true });
});

test('démo : voix un peu moins stable, le reste identique', async () => {
    const twimlModule = '../../voice/src/twiml.ts';
    const { demoVoice } = (await import(twimlModule)) as { demoVoice: (v: string) => string };
    assert.equal(demoVoice('c365oriviHmAhyLhpuN6-turbo_v2_5-0.92_0.5_0.6'), 'c365oriviHmAhyLhpuN6-turbo_v2_5-0.92_0.4_0.6');
    assert.equal(demoVoice('UgBBYS2sOqTuMpoF3BR0'), 'UgBBYS2sOqTuMpoF3BR0');
});

test('famille : préparer le premier appel seulement avant tout appel et sans réglage du narrateur', async () => {
    const { familySetupOpen } = await import('../../lib/loomina/family-setup');
    assert.equal(familySetupOpen({ meta: {}, status: 'active', calls: 0 }), true);
    assert.equal(familySetupOpen({ meta: {}, status: 'active', calls: 1 }), false);
    assert.equal(familySetupOpen({ meta: {}, status: 'completed', calls: 0 }), false);
    assert.equal(familySetupOpen({ meta: { prefs_set_at: 'x', prefs_set_by: 'author' }, status: 'active', calls: 0 }), false);
    assert.equal(familySetupOpen({ meta: { prefs_set_at: 'x' }, status: 'active', calls: 0 }), false);
    assert.equal(familySetupOpen({ meta: { prefs_set_at: 'x', prefs_set_by: 'giver' }, status: 'active', calls: 0 }), true);
});

test('famille : plusieurs proches, de la commande au webhook', async () => {
    const g = await import('../../lib/loomina/giver');
    const raw = g.encodeFamilyForStripe([
        { firstName: 'Léa', phone: '+33611111111' },
        { firstName: 'Léa bis', phone: '+33611111111' },
        { firstName: 'Tom', phone: 'pas un numéro' },
        { firstName: 'Narrateur', phone: '+33622222222' },
    ]);
    assert.ok(raw.length <= 500);
    const back = g.decodeFamilyFromStripe(raw, ['+33622222222', '+33633333333'], '2026-11-20T00:00:00Z');
    assert.deepEqual(back.map((m) => [m.firstName, m.phone, m.addedBy]), [['Léa', '+33611111111', 'order']]);
    const meta = { giver: { first_name: 'Solal', phone: '+33633333333' }, family_members: g.storeFamilyMembers(back) };
    assert.deepEqual(g.familyAudience(meta).map((p) => [p.phone, p.giver]), [['+33633333333', true], ['+33611111111', false]]);
    assert.equal(g.familyMemberOf(meta, '+33611111111')?.firstName, 'Léa');
    assert.equal(g.familyMemberOf(meta, '+33699999999'), null);
    assert.equal(g.familyWelcomeDone({ family_welcome_done: g.markFamilyWelcome({}, '+33611111111') }, '+33611111111'), true);
    assert.equal(g.familyWelcomeDone({ family_welcome_done: g.markFamilyWelcome({}, '+33611111111') }, '+33633333333'), false);
    // Dix numéros au plus, et toujours sous la limite de Stripe.
    const many = Array.from({ length: 15 }, (_, i) => ({ firstName: 'Prénom assez long ' + i, phone: `+336000000${String(i).padStart(2, '0')}` }));
    assert.ok(g.encodeFamilyForStripe(many).length <= 500);
});

test('lien de connexion directe : court, lié au numéro, refusé s’il est modifié ou expiré', async () => {
    process.env.JWT_SECRET = process.env.JWT_SECRET || 'secret-de-test';
    process.env.LOOMINA_MAGIC_LINKS = 'true';
    const { magicToken, readMagicToken, magicLink } = await import('../../lib/loomina/magic-link');
    const { personalizeSms } = await import('../../lib/loomina/sms');
    const now = Date.UTC(2026, 10, 20);
    const t = magicToken('+33612345670', now)!;
    assert.ok(t.length <= 50, t);
    assert.deepEqual(readMagicToken(t, now), { phone: '+33612345670' });
    // Autre numéro, signature touchée, ou après 30 jours : refusé.
    const [n, e, sig] = t.split('.');
    assert.equal(readMagicToken(`${(parseInt(n, 36) + 1).toString(36)}.${e}.${sig}`, now), null);
    assert.equal(readMagicToken(`${n}.${e}.${sig.slice(0, -1)}${sig.endsWith('A') ? 'B' : 'A'}`, now), null);
    assert.equal(readMagicToken(t, now + 31 * 86_400_000), null);
    assert.match(magicLink('+33612345670'), /\/l\/[0-9a-z]+\.[0-9a-z]+\.[\w-]{22}$/);
    // Dans un SMS, le lien de l'espace devient celui du destinataire.
    const sms = personalizeSms('+33612345670', 'Votre espace : loomina.eu/dashboard');
    assert.match(sms, /Votre espace : loomina\.eu\/l\/\S+$/);
    assert.equal(readMagicToken(sms.split('/l/')[1])?.phone, '+33612345670');
    assert.equal(personalizeSms('+33612345670', 'Rien à changer.'), 'Rien à changer.');
});

test('laisser finir : attendre plus longtemps une phrase pas finie', async () => {
    for (const k of ['PUBLIC_URL', 'NEXT_BASE_URL', 'VAPI_WEBHOOK_SECRET', 'TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN', 'TWILIO_PHONE_NUMBER', 'OPENAI_API_KEY']) process.env[k] ||= 'test';
    const sessionModule = '../../voice/src/session.ts';
    const { holdFor } = (await import(sessionModule)) as { holdFor: (t: string) => number };
    assert.equal(holdFor('Ça va, et toi ?'), 0);
    assert.equal(holdFor('Donc, j\'étais plutôt dans ma'), 3400);
    assert.equal(holdFor('Qui est'), 3400);
    assert.equal(holdFor('Je vais te dire, il y avait mon oncle et'), 3400);
    assert.equal(holdFor('On regardait des vidéos.'), 2800);
    assert.equal(holdFor('Il y avait mon oncle, ma mère, ma grand-mère, Sam et moi.'), 2000);
});

test('ton d’écriture : « Naturel » devient le défaut, chaque ton est expliqué', async () => {
    const { normalizeStyle, styleGuide, WRITING_STYLES } = await import('../../lib/loomina/styles');
    assert.equal(normalizeStyle('Naturel'), 'Naturel et sobre');
    assert.equal(normalizeStyle(null), 'Naturel et sobre');
    for (const s of WRITING_STYLES) assert.ok(styleGuide(s).length > 80, s);
    assert.match(styleGuide('Un ton libre'), /Un ton libre/);
});

test('livre offert : l’e-mail de l’auteur ne part pas chez la personne qui a offert', async () => {
    const { authorOwnEmail } = await import('../../lib/loomina/notify');
    assert.equal(authorOwnEmail({ email: 'paul@x.fr' }, { is_gift: true, buyer_email: 'paul@x.fr' }), null);
    assert.equal(authorOwnEmail({ email: 'paul+33611111111@x.fr' }, { is_gift: true }), null);
    assert.equal(authorOwnEmail({ email: 'jeanne@x.fr' }, { is_gift: false }), 'jeanne@x.fr');
    assert.equal(authorOwnEmail({ email: null }, null), null);
});

test('e-mail de la démo : « 1er décembre »', async () => {
    const { demoEmail } = await import('../../lib/loomina/demo-story');
    const e = demoEmail({ firstName: 'Jeanne', title: 'La maison', promo: { code: 'X', expires: new Date('2026-12-01T12:00:00Z') } });
    assert.match(e.text, /jusqu’au 1er décembre/);
});

test('démo sans commande : rappel deux jours avant la fin du code, une seule fois', async () => {
    const { demoReminderDue, demoReminderEmail } = await import('../../lib/loomina/demo-story');
    const now = Date.UTC(2026, 11, 1, 10);
    const row = { email: 'a@b.fr', promo_code: 'RECITX', promo_expires_at: new Date(now + 40 * 3600_000).toISOString(), promo_reminded_at: null };
    assert.equal(demoReminderDue(row, now), true);
    assert.equal(demoReminderDue({ ...row, promo_expires_at: new Date(now + 60 * 3600_000).toISOString() }, now), false);
    assert.equal(demoReminderDue({ ...row, promo_expires_at: new Date(now + 2 * 3600_000).toISOString() }, now), false);
    assert.equal(demoReminderDue({ ...row, promo_reminded_at: new Date(now).toISOString() }, now), false);
    assert.equal(demoReminderDue({ ...row, email: null }, now), false);
    const e = demoReminderEmail({ firstName: 'Jeanne', title: 'La maison', code: 'RECITX', expires: new Date('2026-12-03T12:00:00Z'), storyUrl: 'https://loomina.eu/recit/abc', optOut: 'Vous ne souhaitez plus recevoir ces rappels ? https://loomina.eu/desinscription?t=x' });
    assert.match(e.subject, /se termine le 3\u00a0décembre/);
    assert.match(e.text, /order\?code=RECITX/);
    assert.match(e.text, /recit\/abc/);
    assert.match(e.html, /desinscription/);
    assert.doesNotMatch(e.text, /€/);
});

// ── Écoute des appels (lib/admin/ecoute.ts, 24/11/2026) ─────────────────────
import { encodeWav, parseWav, speechSegments, measureTiming, pickLoominaChannel } from '../../lib/admin/ecoute';

test('écoute : Loomina qui parle pendant une pause du narrateur est comptée comme coupée', () => {
    const rate = 8000;
    const dur = 12;
    const track = (spans: Array<[number, number]>) => {
        const a = new Int16Array(rate * dur);
        for (let i = 0; i < a.length; i++) a[i] = ((i * 7919) % 31) - 15; // bruit de fond faible
        for (const [s, e] of spans) for (let i = s * rate; i < e * rate; i++) a[i] = Math.round(Math.sin(i / 3) * 8000);
        return a;
    };
    const bot = track([[0, 3], [6.8, 8.5], [10.2, 11.5]]);
    const user = track([[3.5, 6], [7.2, 9.5]]);
    // WAV deux pistes : narrateur à gauche, Loomina à droite.
    const head = encodeWav(bot, rate).subarray(0, 44);
    const wav = new Uint8Array(44 + bot.length * 4);
    wav.set(head);
    const v = new DataView(wav.buffer);
    v.setUint32(4, 36 + bot.length * 4, true);
    v.setUint16(22, 2, true);
    v.setUint32(28, rate * 4, true);
    v.setUint16(32, 4, true);
    v.setUint32(40, bot.length * 4, true);
    for (let i = 0; i < bot.length; i++) {
        v.setInt16(44 + i * 4, user[i], true);
        v.setInt16(46 + i * 4, bot[i], true);
    }
    const pcm = parseWav(wav);
    const segs = pcm.channels.map((c) => speechSegments(c, rate));
    const b = pickLoominaChannel(segs, 300, 200);
    assert.equal(b, 1);
    const t = measureTiming(segs[0], segs[1], dur);
    assert.equal(t.cuts.length, 1);
    assert.equal(t.cuts[0].at, 6.8);
    assert.equal(t.cuts[0].pause, 0.8);
    assert.equal(t.loominaWait.median, 0.7);
});

test('voix : les tournures interdites sont retirées avant la voix (24/11/2026)', async () => {
    const { tidyReply } = await import('../../voice/src/speech.ts');
    assert.equal(tidyReply('Tu te souviens d’un moment précis où il t’a fait rire, ou d’une blague qu’il aimait faire ?'), 'Parle-moi d’un moment précis où il t’a fait rire.');
    assert.equal(tidyReply('Merci. Tu te souviens du costume, ou d’un moment sur scène ce jour-là ?'), 'Merci. Parle-moi du costume.');
    assert.equal(tidyReply('Tu disais que tu dormais souvent chez tes parents. Avec qui ?'), 'Tu dormais souvent chez tes parents. Avec qui ?');
    assert.equal(tidyReply('Tu te souviens comment elle s’appelait ?'), 'Comment elle s’appelait ?');
    assert.equal(tidyReply('Il y avait quelque chose qui t’impressionnait ou qui te plaisait dans cette maison ?'), 'Il y avait quelque chose qui t’impressionnait ?');
    assert.equal(tidyReply('C’était toi ou ta sœur ?'), 'C’était toi ou ta sœur ?');
    assert.equal(tidyReply('Ah, Sidi Ferruch. C’était où exactement ?'), 'Ah, Sidi Ferruch. C’était où exactement ?');
});

test('voix : les noms propres de l’auteur vont à la transcription', async () => {
    const { authorHints } = await import('../../voice/src/plan.ts');
    const hints = authorHints({ identity: { full_name: 'Patricia', places: ['Alger', 'la Casbah', 'Bab El Oued'] }, family: [{ name: 'Charlie' }, { name: 'Charlie' }] });
    assert.deepEqual(hints, ['Patricia', 'Alger', 'Casbah', 'Bab El Oued', 'Charlie']);
});
