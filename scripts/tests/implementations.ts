/**
 * Vérifie les ajouts du 17/11/2026 (commentaires de Solal sur la carte).
 *
 *   voice/node_modules/.bin/tsx --tsconfig tsconfig.json scripts/tests/implementations.ts [--sms]
 *
 * Trois parties :
 *  A. sans réseau : règles de la voix, garde-fous des prompts, adresse, coûts, textes ;
 *  B. avec la base : un profil de test (marqué « banc », effacé à la fin) pour la
 *     remarque d'auteur appliquée par l'IA, le livre remboursé, le remboursement refusé ;
 *  C. avec `--sms` : UN vrai SMS d'alerte au numéro de l'équipe.
 * Aucun SMS ni e-mail ne part vers un client : Twilio est neutralisé en A et B.
 */

import './lib/env';
import fs from 'node:fs';
import assert from 'node:assert/strict';

const realTwilio = { sid: process.env.TWILIO_ACCOUNT_SID, token: process.env.TWILIO_AUTH_TOKEN };
// Parties A et B : aucun SMS possible.
process.env.TWILIO_ACCOUNT_SID = '';
process.env.TWILIO_AUTH_TOKEN = '';

const results: Array<{ part: string; name: string; ok: boolean; detail?: string }> = [];
async function check(part: string, name: string, fn: () => void | Promise<void>) {
    try {
        await fn();
        results.push({ part, name, ok: true });
        console.log(`  ok   ${name}`);
    } catch (err) {
        const detail = err instanceof Error ? err.message.split('\n')[0] : String(err);
        results.push({ part, name, ok: false, detail });
        console.log(`  ÉCHEC ${name} — ${detail}`);
    }
}

async function main() {
    const { buildAssistant, DEMO_SYSTEM, phaseCheck } = await import('../../lib/loomina/assistant');
    const { voicePromptTemplate } = await import('../../lib/loomina/voice-prompt');
    const { hardLimitSeconds, timeNote } = await import('../../lib/loomina/call-length');
    const { missingFromEdit, templateVars } = await import('../../lib/loomina/prompt-store');
    const { parseShipping } = await import('../../lib/loomina/shipping');
    const { welcomeTexts, familyNewsText, abandonedCartTexts, teamContacts } = await import('../../lib/loomina/notify');
    const { reminderText, dueReminder } = await import('../../lib/loomina/reminder');
    const { COSTS } = await import('../../config/costs');
    const { photoTopic } = await import('../../lib/loomina/photos');
    type Profile = import('../../lib/loomina/db').Profile;
    type Project = import('../../lib/loomina/db').Project;

    const profile = { id: 'p', first_name: 'Jeanne', last_name: 'Martin', full_name: 'Jeanne Martin', email: 'j@x.fr', phone_number: '+33611111111', politeness_preference: 'vous', writing_style: 'Naturel', sensitive_topics: null, first_name_phonetic: null } as unknown as Profile;
    const project = (over: Record<string, unknown> = {}, meta: Record<string, unknown> = {}) =>
        ({ id: 'j', user_id: 'p', title: 'Biographie', status: 'active', phase: 2, phase_progress: 40, current_topic_id: 1, next_question_strategy: 'Racontez-moi la maison.', global_context: null, context: { identity: { full_name: 'Jeanne Martin' }, last_call: { summary: 'Elle a parlé de Lyon.' }, suggested_topics: [], ...((over.context as object) ?? {}) }, project_metadata: { prefs_set_at: '2026-11-01', ...meta }, ...over }) as unknown as Project;
    const prompt = (p: Project) => buildAssistant({ profile, project: p, prompt: null, phase: 2, serverUrl: 'test' }).assistant.model.messages[0].content as string;

    console.log('\nA. Règles et garde-fous (sans réseau)');
    await check('A', 'Silence : 30 s avant la relance, 60 s avant de raccrocher', () => {
        const src = fs.readFileSync('voice/src/config.ts', 'utf8');
        assert.match(src, /VOICE_SILENCE_SECONDS', '30'/);
        assert.match(src, /VOICE_HANGUP_SILENCE_SECONDS', '60'/);
    });
    await check('A', 'Durée : plafond de 1 h 30 quelle que soit la durée souhaitée', () => {
        for (const m of [15, 20, 30, 45]) assert.equal(hardLimitSeconds(m, 2700), 5400);
        assert.match(timeNote(40 * 60, 20), /Si elle veut continuer, continue/);
    });
    await check('A', 'Sujets suggérés : plus de maximum par appel', () => {
        const s = prompt(project({ context: { suggested_topics: ['Les vacances à Royan', 'Le premier vélo', 'Le mariage'] } }));
        assert.match(s, /pas de nombre maximum/);
        assert.doesNotMatch(s, /Jamais plus de deux par appel/);
    });
    await check('A', 'Photo : Loomina dit qu’elle l’a vue et demande si on veut en dire plus', () => {
        const topic = photoTopic({ caption: 'Mariage 1952', description: 'Un couple devant une église.', question: 'Qui était là ce jour-là ?', chapter: null });
        assert.match(topic, /^Photo envoyée/);
        assert.match(prompt(project({ context: { suggested_topics: [topic] } })), /Si le sujet commence par « Photo envoyée »[^\n]*J'ai vu la photo/);
    });
    await check('A', 'Fin de partie : Loomina rappelle ce qui a été raconté avant de demander', () => {
        const p = project({}, { phase_state: { phase: 2, covered: ['heritage', 'maison', 'proches', 'ecole', 'figures', 'depart'], skipped: [], check: 'to_ask' } });
        const c = phaseCheck(p, { first_name: 'Jeanne', politeness_preference: 'vous' });
        assert.ok(c, 'pas de point à faire');
        assert.match(c!.block, /Marque d'abord la fin de cette partie/);
        assert.match(c!.block, /ajouter des détails/);
    });
    await check('A', 'Démo : répond sur le prix, le remboursement et le fonctionnement', () => {
        assert.match(DEMO_SYSTEM, /449 euros/);
        assert.match(DEMO_SYSTEM, /remboursement intégral[^\n]*7 jours/);
        assert.doesNotMatch(DEMO_SYSTEM, /ne parle pas de prix/);
    });
    await check('A', 'Hors sujet ou piège : refus en démo et en entretien', () => {
        assert.match(DEMO_SYSTEM, /tu n'es pas fait pour ça/);
        assert.match(prompt(project()), /tu n'es pas fait pour ça/);
        assert.match(prompt(project()), /ni de prix, ni de remboursement/);
    });
    await check('A', 'Premier appel : prévient que les conversations sont enregistrées', () => {
        assert.match(voicePromptTemplate({ phase: 1, firstCall: true, politenessAlreadySet: false, topicsAlreadyKnown: false }), /conversations sont enregistrées/);
        assert.match(voicePromptTemplate({ phase: 1, firstCall: true, politenessAlreadySet: true, topicsAlreadyKnown: true }), /en deux temps courts/);
    });
    await check('A', 'Enregistrement : jamais pour une démonstration', () => {
        const src = fs.readFileSync('voice/src/server.ts', 'utf8');
        assert.match(src, /config\.recordingEnabled && !session\.plan\.demo/);
    });
    await check('A', 'Prompts : une variable ou ##END_CALL## oubliés font refuser l’enregistrement', () => {
        assert.deepEqual(missingFromEdit('Bonjour {{first_name}}, {{politeness_preference}}', 'Bonjour {{first_name}}'), ['{{politeness_preference}}']);
        assert.deepEqual(missingFromEdit('Fin ##END_CALL##', 'Fin'), ['##END_CALL##']);
        assert.deepEqual(missingFromEdit('Réponds en JSON : {}', 'Réponds.'), ['la consigne de réponse en JSON']);
        assert.deepEqual(missingFromEdit('Bonjour {{first_name}}', 'Salut {{ first_name }} !'), []);
        assert.deepEqual(templateVars('{{b}} {{a}} {{a}}'), ['a', 'b']);
    });
    await check('A', 'Adresse de livraison : champs obligatoires et code postal français', () => {
        assert.equal(typeof parseShipping({ name: 'A', line1: '1 rue X', city: 'Lyon', postalCode: '6900' }), 'string');
        assert.equal(typeof parseShipping({ name: '', line1: '1 rue X', city: 'Lyon', postalCode: '69001' }), 'string');
        const ok = parseShipping({ name: ' Jeanne  Martin ', line1: '1 rue X', line2: '', city: 'Lyon', postalCode: '69 001' });
        assert.equal(typeof ok, 'object');
        assert.equal((ok as { postalCode: string }).postalCode, '69001');
        assert.equal((ok as { name: string }).name, 'Jeanne Martin');
    });
    await check('A', 'Bienvenue : livre offert, le SMS va à celui qui offre', () => {
        const w = welcomeTexts({ buyerEmail: 'a@b.fr', narratorFirstName: 'Jeanne', narratorPhone: '+33611111111', isGift: true, giver: { first_name: 'Paul', phone: '+33622222222' } });
        assert.equal(w.smsTo, '+33622222222');
        assert.match(w.sms, /01 59 16 93 57/);
    });
    await check('A', 'Famille : sans titre, la nouvelle ne cite aucun récit', () => {
        assert.doesNotMatch(familyNewsText('new_story', 'Jeanne').text, /«/);
        assert.match(familyNewsText('new_story', 'Jeanne', 'La maison').text, /« La maison »/);
    });
    await check('A', 'Panier abandonné : lien de reprise dans les trois e-mails, le dernier le dit', () => {
        const cart = { email: 'a@b.fr', firstName: 'Paul', isGift: false, narratorFirstName: 'Paul', recoveryUrl: 'https://checkout.stripe.com/c/pay/x' };
        for (const step of [1, 2, 3] as const) assert.match(abandonedCartTexts(cart, step).email, /checkout\.stripe\.com/);
        assert.match(abandonedCartTexts(cart, 3).email, /dernier message/);
    });
    await check('A', 'Rappel de rendez-vous : 30 minutes avant, tu ou vous', () => {
        const s = { active: true, days: [1, 2, 3, 4, 5, 6, 7], time: '15:00' };
        assert.equal(dueReminder(s, new Date('2026-11-18T13:32:00Z')), '2026-11-18 15:00'); // 14 h 32 à Paris
        assert.equal(dueReminder(s, new Date('2026-11-18T13:20:00Z')), null);
        assert.equal(dueReminder(s, new Date('2026-11-18T13:45:00Z')), null);
        assert.match(reminderText('Jeanne', false, '15:00'), /Je vous appelle tout à l'heure, à 15 h/);
        assert.match(reminderText('Léo', true, '09:30'), /Je t'appelle tout à l'heure, à 9 h 30/);
    });
    await check('A', 'Coûts : la grille donne un prix cohérent pour un appel type', async () => {
        const { tokensCostUsd } = await import('../../lib/admin/costs');
        // 20 000 jetons lus et 3 000 écrits par gpt-5.5 : 0,10 + 0,09 = 0,19 $.
        assert.ok(Math.abs(tokensCostUsd({ model: 'gpt-5.5', input: 20000, cached: 0, output: 3000 }) - 0.19) < 1e-9);
        assert.ok(tokensCostUsd({ model: 'gpt-4.1', input: 100000, cached: 80000, output: 2000 }) < tokensCostUsd({ model: 'gpt-4.1', input: 100000, cached: 0, output: 2000 }));
        assert.ok(COSTS.vat === 0.2 && COSTS.usdToEur > 0.5 && COSTS.usdToEur < 1.2);
    });
    await check('A', 'Alertes : adresse et numéro de l’équipe', () => {
        assert.equal(teamContacts().email, 'contact@loomina.eu');
    });

    if (process.argv.includes('--sans-base') && !process.argv.includes('--sms')) return finish();
    if (!process.argv.includes('--sans-base')) await partB();
    await partC();
    finish();

  async function partB() {

    console.log('\nB. Avec la base (profil de test, effacé à la fin)');
    const { db, findActiveProject } = await import('../../lib/loomina/db');
    const { createAccount, cleanup } = await import('./lib/profils');
    const { queueCorrection, readPending, sweepCorrections } = await import('../../lib/loomina/corrections');
    const { refundClient, retryEvent } = await import('../../lib/admin/actions');
    const { refreshPrompts, promptText, savePrompt, resetPrompt } = await import('../../lib/loomina/prompt-store');
    const { readShipping } = await import('../../lib/loomina/shipping');

    const account = await createAccount({ slug: 'verif', prenom: 'Marcel', nom: 'Essai', prefsReglees: true, phase: 2, progression: 30, contexte: { identity: { full_name: 'Marcel Essai' }, last_call: { summary: 'Marcel a parlé de sa grand-mère.' } } }, String(Date.now()).slice(-8));
    const pid = account.project.id;
    try {
        const original = 'Chez ma grand-mère Rosa, à Rennes, la cuisine sentait toujours le café. Rosa tricotait près de la fenêtre et me racontait le marché du samedi. Je passais mes jeudis chez elle.';
        const { error: chErr } = await db().from('chapters').insert({ project_id: pid, chapter_number: 1, phase: 2, title: 'Les jeudis chez ma grand-mère', content_markdown: original, word_count: 30, status: 'draft', version: 1 });
        if (chErr) throw new Error(`création du récit de test : ${chErr.message}`);

        await check('B', 'Remarque d’auteur : mise en attente', async () => {
            await queueCorrection(pid, 1, 'Ma grand-mère s’appelait Rose, pas Rosa. Et c’était à Brest, pas à Rennes.');
            const { data } = await db().from('projects').select('project_metadata').eq('id', pid).single();
            assert.equal(readPending(data!.project_metadata as Record<string, unknown>).length, 1);
        });
        await check('B', 'Remarque d’auteur : pas appliquée avant le délai', async () => {
            const r = await sweepCorrections();
            assert.equal(r.applied, 0);
            const { data } = await db().from('chapters').select('content_markdown').eq('project_id', pid).eq('chapter_number', 1).single();
            assert.equal(data!.content_markdown, original);
        });
        await check('B', 'Remarque d’auteur : appliquée par l’IA après le délai (récit, mémoire, file vidée)', async () => {
            const { data } = await db().from('projects').select('project_metadata').eq('id', pid).single();
            const meta = data!.project_metadata as Record<string, unknown>;
            const pending = readPending(meta).map((c) => ({ ...c, at: new Date(Date.now() - 6 * 60 * 1000).toISOString() }));
            await db().from('projects').update({ project_metadata: { ...meta, pending_corrections: pending } }).eq('id', pid);
            const r = await sweepCorrections();
            assert.equal(r.applied, 1, `appliquées : ${r.applied}, en échec : ${r.failed}`);
            const { data: ch } = await db().from('chapters').select('content_markdown, version').eq('project_id', pid).eq('chapter_number', 1).single();
            const text = ch!.content_markdown as string;
            assert.match(text, /Rose/);
            assert.doesNotMatch(text, /Rosa\b/);
            assert.match(text, /Brest/);
            assert.doesNotMatch(text, /Rennes/);
            assert.match(text, /café/, 'le reste du récit doit être conservé');
            assert.equal(ch!.version, 2);
            const { data: pj } = await db().from('projects').select('project_metadata, context').eq('id', pid).single();
            assert.equal(readPending(pj!.project_metadata as Record<string, unknown>).length, 0);
            assert.match(JSON.stringify((pj!.context as { author_corrections?: string[] }).author_corrections ?? []), /Rose/);
        });
        await check('B', 'Remboursement : refusé proprement sans paiement Stripe', async () => {
            const r = await refundClient(account.profile.id);
            assert.equal(r.ok, false);
            assert.match(r.message, /Pas de paiement Stripe/);
        });
        await check('B', 'Livre remboursé : plus d’entretien ni d’espace auteur', async () => {
            assert.equal((await findActiveProject(account.profile.id))?.id, pid);
            const { data } = await db().from('projects').select('project_metadata').eq('id', pid).single();
            const meta = data!.project_metadata as Record<string, unknown>;
            await db().from('projects').update({ project_metadata: { ...meta, refunded_at: new Date().toISOString() } }).eq('id', pid);
            assert.equal(await findActiveProject(account.profile.id), null);
            await db().from('projects').update({ project_metadata: meta }).eq('id', pid);
        });
        await check('B', 'Adresse de livraison : gardée sur le livre', async () => {
            const { data } = await db().from('projects').select('project_metadata').eq('id', pid).single();
            const meta = data!.project_metadata as Record<string, unknown>;
            const s = parseShipping({ name: 'Marcel Essai', line1: '3 rue des Lilas', city: 'Brest', postalCode: '29200' });
            await db().from('projects').update({ project_metadata: { ...meta, shipping: s } }).eq('id', pid);
            const { data: after } = await db().from('projects').select('project_metadata').eq('id', pid).single();
            assert.equal(readShipping(after!.project_metadata as Record<string, unknown>)?.city, 'Brest');
        });
        await check('B', 'Appel en échec : « Relancer » ne touche qu’un appel en échec', async () => {
            const r = await retryEvent('00000000-0000-0000-0000-000000000000');
            assert.equal(r.ok, false);
        });
        await check('B', 'Prompt modifié dans l’admin : pris en compte, puis retour au texte d’origine', async () => {
            const key = 'voix.rappel';
            const { ONE_QUESTION_REMINDER } = await import('../../lib/loomina/assistant');
            await savePrompt(key, ONE_QUESTION_REMINDER + '\n- Essai automatique.');
            await refreshPrompts(true);
            assert.match(promptText(key, ONE_QUESTION_REMINDER), /Essai automatique/);
            assert.match(prompt(project()), /Essai automatique/, 'le prompt de la voix doit reprendre le texte modifié');
            await resetPrompt(key);
            assert.equal(promptText(key, ONE_QUESTION_REMINDER), ONE_QUESTION_REMINDER);
        });
    } finally {
        // Sécurité : le prompt d'essai ne doit jamais rester en ligne.
        await (await import('../../lib/loomina/prompt-store')).resetPrompt('voix.rappel').catch(() => {});
        const removed = await cleanup();
        console.log(`  (${removed} profil(s) de test effacé(s))`);
    }

  }

  async function partC() {
    if (process.argv.includes('--sms')) {
        console.log('\nC. Un vrai SMS d’alerte à l’équipe');
        // `lib/env` neutralise Twilio pour tout le banc : pour ce seul envoi, on relit les vrais identifiants.
        const env = Object.fromEntries(fs.readFileSync('.env.local', 'utf8').split('\n').filter((l) => l.includes('=')).map((l) => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim().replace(/^["']|["']$/g, '')]));
        process.env.TWILIO_ACCOUNT_SID = env.TWILIO_ACCOUNT_SID ?? realTwilio.sid;
        process.env.TWILIO_AUTH_TOKEN = env.TWILIO_AUTH_TOKEN ?? realTwilio.token;
        const { sendSms } = await import('../../lib/loomina/sms');
        await check('C', 'SMS d’alerte envoyé au numéro de l’équipe', async () => {
            const to = process.env.LOOMINA_ALERT_PHONE;
            assert.ok(to, 'LOOMINA_ALERT_PHONE manquante');
            assert.equal(await sendSms(to!, 'Loomina admin — essai : vos alertes par SMS fonctionnent. Vous recevrez ici les nouvelles commandes, les appels en échec et les clients à relancer.'), true);
        });
    }
  }
}

function finish() {
    const failed = results.filter((r) => !r.ok);
    console.log(`\n${results.length - failed.length} réussi(s), ${failed.length} en échec.`);
    fs.writeFileSync('scripts/tests/rapports/implementations.json', JSON.stringify(results, null, 2));
    process.exit(failed.length ? 1 : 0);
}

main().catch((err) => {
    console.error(err);
    process.exit(2);
});
