/**
 * Compose le livre à partir des récits d'appel d'une série déjà passée, et
 * le fait juger : mieux que les récits mis bout à bout ? rien d'inventé,
 * rien de perdu ?
 *
 *   npm run test:livre                       la dernière série qui contient un livre
 *   npm run test:livre -- 2026-11-16-15-13   une série précise
 *
 * Aucun appel simulé, aucune écriture en base.
 */

import './lib/env';
import fs from 'node:fs';
import path from 'node:path';
import OpenAI from 'openai';
import { composeBook, renderBook } from '../../lib/loomina/book';
import { normalizeContext } from '../../lib/loomina/context';
import { judgeBook, FINE_JUDGE_MODEL } from './lib/juges';
import { usage } from './lib/env';

const ROOT = path.join(process.cwd(), 'scripts', 'tests', 'rapports');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY, maxRetries: 2, timeout: 280_000 });

/** Le livre composé comparé à sa matière : inventé ? perdu ? */
async function judgeFidelity(sources: string, book: string): Promise<{ inventions: string[]; pertes: string[] }> {
    const res = await openai.chat.completions.create({
        model: FINE_JUDGE_MODEL,
        reasoning_effort: 'low',
        response_format: { type: 'json_object' },
        messages: [
            {
                role: 'system',
                content: `Un livre a été composé à partir de récits recueillis au fil d'entretiens. Les récits sont la seule source des faits. Compare.
- "inventions" : chaque fait, détail, parole, date ou émotion du LIVRE qui ne figure dans AUCUN récit. Les reformulations fidèles et les transitions neutres ne comptent pas. Cite le passage.
- "pertes" : chaque scène ou fait marquant des RÉCITS absent du livre (au plus 12). Les politesses d'appel et les redites ne sont pas des pertes.
Réponds en JSON : {"inventions":[],"pertes":[]}`,
            },
            { role: 'user', content: `# LES RÉCITS\n${sources}\n\n# LE LIVRE COMPOSÉ\n${book}` },
        ],
    });
    const out = JSON.parse(res.choices[0]?.message?.content ?? '{}');
    const list = (v: unknown) => (Array.isArray(v) ? v.map((x) => (typeof x === 'string' ? x : JSON.stringify(x))) : []);
    return { inventions: list(out.inventions), pertes: list(out.pertes) };
}

async function main() {
    const wanted = process.argv[2];
    const runs = fs.readdirSync(ROOT).filter((d) => fs.existsSync(path.join(ROOT, d, 'resultats.json'))).sort().reverse();
    /* eslint-disable @typescript-eslint/no-explicit-any */
    let found: { run: string; snap: any } | null = null;
    for (const run of wanted ? [wanted] : runs) {
        const results = JSON.parse(fs.readFileSync(path.join(ROOT, run, 'resultats.json'), 'utf8')) as any[];
        const book = results.find((r) => r.calls?.length > 1);
        const snap = book?.calls?.at(-1)?.after;
        if (snap?.chapters?.length >= 3) { found = { run, snap }; break; }
    }
    if (!found) { console.error('Aucune série avec un livre complet.'); process.exit(2); }
    const { run, snap } = found;
    const sources = snap.chapters.map((c: any) => ({ number: c.chapter_number, title: c.title, content: c.content_markdown }));
    const raw = sources.map((s: any) => `## Chapitre ${s.number} — ${s.title}\n\n${s.content}`).join('\n\n');
    console.log(`Série ${run} : ${sources.length} récits d'appel, ${raw.split(/\s+/).length} mots. Composition…`);

    const t0 = Date.now();
    const edition = await composeBook({ sources, context: normalizeContext(snap.project.context), sensitiveTopics: snap.profile.sensitive_topics, writingStyle: snap.profile.writing_style });
    const seconds = Math.round((Date.now() - t0) / 1000);
    const book = renderBook(edition);
    const out = path.join(ROOT, run, 'livre-compose.md');
    fs.writeFileSync(out, book);
    fs.writeFileSync(path.join(ROOT, run, 'livre-compose.json'), JSON.stringify(edition, null, 2));
    console.log(`Livre composé en ${seconds} s : ${edition.chapters.length} chapitres, ${edition.word_count} mots (matière : ${edition.source_words} mots).`);
    for (const c of edition.chapters) console.log(`  ${c.number}. [${c.part}] ${c.title} — ${c.word_count} mots, récits ${c.sources.join(', ')}`);

    const [before, after, fidelity] = await Promise.all([judgeBook(raw), judgeBook(book), judgeFidelity(raw, book)]);
    console.log(`\nL'éditeur — récits bout à bout : ${before.note}/10 (${before.repetitions.length} redites, ${before.contradictions.length} contradictions)`);
    console.log(`L'éditeur — livre composé      : ${after.note}/10 (${after.repetitions.length} redites, ${after.contradictions.length} contradictions)`);
    console.log(`  ${after.verdict}`);
    for (const r of after.repetitions) console.log(`  Redite : ${r}`);
    for (const r of after.contradictions) console.log(`  Contradiction : ${r}`);
    for (const r of after.trous.slice(0, 5)) console.log(`  Manque : ${r}`);
    console.log(`\nFidélité à la matière : ${fidelity.inventions.length} détail(s) inventé(s), ${fidelity.pertes.length} scène(s) perdue(s).`);
    for (const i of fidelity.inventions) console.log(`  Inventé : ${i}`);
    for (const p of fidelity.pertes) console.log(`  Perdu : ${p}`);
    for (const [model, u] of Object.entries(usage)) console.log(`\nJuges — ${model} : ${u.calls} requêtes, ${u.input} jetons lus, ${u.output} écrits.`);
    console.log(`Livre : ${out}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
