/**
 * Crée un profil de test déjà rempli des récits d'appel d'une série passée,
 * pour essayer le livre composé dans l'espace auteur sans repasser d'appels.
 *
 *   npm run test:semer                       les récits du dernier livre simulé
 *   npm run test:semer -- 2026-11-16-15-13   ceux d'une série précise
 *
 * Affiche le numéro fictif du profil : à mettre dans LOOMINA_DEV_PHONE pour
 * ouvrir son espace auteur sous `next dev`. `npm run test:appels -- --nettoyer`
 * l'efface.
 */

import './lib/env';
import fs from 'node:fs';
import path from 'node:path';
import { createAccount } from './lib/profils';
import { db } from '../../lib/loomina/db';

const ROOT = path.join(process.cwd(), 'scripts', 'tests', 'rapports');

async function main() {
    const wanted = process.argv[2];
    const runs = fs.readdirSync(ROOT).filter((d) => fs.existsSync(path.join(ROOT, d, 'resultats.json'))).sort().reverse();
    /* eslint-disable @typescript-eslint/no-explicit-any */
    let snap: any = null;
    for (const run of wanted ? [wanted] : runs) {
        const results = JSON.parse(fs.readFileSync(path.join(ROOT, run, 'resultats.json'), 'utf8')) as any[];
        snap = results.find((r) => r.calls?.length > 1)?.calls?.at(-1)?.after;
        if (snap?.chapters?.length >= 3) break;
    }
    if (!snap) { console.error('Aucune série avec un livre complet.'); process.exit(2); }

    const account = await createAccount(
        { slug: 'semis', prenom: snap.profile.first_name, nom: snap.profile.last_name ?? 'Test', prefsReglees: true, phase: snap.project.phase, progression: snap.project.phase_progress, contexte: snap.project.context, questionSuivante: snap.project.next_question_strategy },
        String(Date.now()).slice(-8)
    );
    const { error } = await db().from('chapters').insert(
        snap.chapters.map((c: any) => ({ project_id: account.project.id, chapter_number: c.chapter_number, phase: c.phase, title: c.title, content_markdown: c.content_markdown, word_count: c.word_count, status: 'draft', version: 1 }))
    );
    if (error) throw new Error(error.message);
    console.log(`${snap.chapters.length} récits d'appel semés pour ${snap.profile.first_name}.`);
    console.log(`NUMERO=${account.phone}`);
}
main().catch((e) => { console.error(e); process.exit(1); });
