/**
 * Audit gratuit de Loomina : tout ce qui se vérifie sans payer un modèle.
 *
 *   npm run audit                 tout
 *   npm run audit -- --vite       sans le build (le plus long)
 *   npm run audit -- --json       le résultat en JSON (pour le skill d'audit)
 *
 * Contrôles :
 *  1. types du site, lint, types du serveur vocal ;
 *  2. tests unitaires (règles du code) et PDF du livre (sans base ni modèle) ;
 *  3. build Next.js ;
 *  4. règles de Solal dans les textes (jamais « relié », pas de « à partir de » devant le prix) ;
 *  5. La carte (lib/admin/map.ts) : chaque chemin « code » existe, pas deux cases avec le même id,
 *     et la date du dernier audit écrite dans la case « k-audit ».
 *
 * Aucun appel à OpenAI, aucune écriture en base, aucun SMS. Coût : 0 €.
 * Les vérifications en ligne (Vercel, Render, Supabase, Stripe, Twilio) sont faites
 * par le skill d'audit avec les connecteurs, pas par ce script.
 */

import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { tmpdir } from 'node:os';

const ROOT = join(__dirname, '..', '..');
const args = new Set(process.argv.slice(2));
const QUICK = args.has('--vite');
const JSON_OUT = args.has('--json');

type Result = { name: string; ok: boolean; ms: number; detail: string };
const results: Result[] = [];

function run(name: string, cmd: string, argv: string[], cwd = ROOT) {
    const t = Date.now();
    const r = spawnSync(cmd, argv, { cwd, encoding: 'utf8', env: { ...process.env, NEXT_TELEMETRY_DISABLED: '1' }, maxBuffer: 64 * 1024 * 1024 });
    const out = `${r.stdout ?? ''}${r.stderr ?? ''}`.trim();
    const ok = r.status === 0;
    results.push({ name, ok, ms: Date.now() - t, detail: ok ? lastLines(out, 2) : lastLines(out, 15) });
}

function check(name: string, fn: () => string[]) {
    const t = Date.now();
    let problems: string[];
    try {
        problems = fn();
    } catch (e) {
        problems = [String(e)];
    }
    results.push({ name, ok: problems.length === 0, ms: Date.now() - t, detail: problems.slice(0, 20).join('\n') });
}

function lastLines(s: string, n: number) {
    return s.split('\n').filter(Boolean).slice(-n).join('\n');
}

function walk(dir: string, exts: string[], out: string[] = []): string[] {
    if (!existsSync(dir)) return out;
    for (const name of readdirSync(dir)) {
        if (name === 'node_modules' || name.startsWith('.')) continue;
        const p = join(dir, name);
        if (statSync(p).isDirectory()) walk(p, exts, out);
        else if (exts.some((e) => p.endsWith(e))) out.push(p);
    }
    return out;
}

const bin = (name: string) => join(ROOT, 'node_modules', '.bin', name);
const tsx = join(ROOT, 'voice', 'node_modules', '.bin', 'tsx');

// 1. Types et lint
run('Types du site', bin('tsc'), ['--noEmit']);
run('Lint', bin('eslint'), []);
run('Types du serveur vocal', join(ROOT, 'voice', 'node_modules', '.bin', 'tsc'), ['--noEmit'], join(ROOT, 'voice'));

// 2. Tests gratuits
run('Tests unitaires', tsx, ['--tsconfig', 'tsconfig.json', '--test', 'scripts/tests/unitaires.test.ts']);
run('PDF du livre', tsx, ['--tsconfig', 'tsconfig.json', 'scripts/tests/livre-pdf.ts', join(tmpdir(), 'loomina-audit-pdf')]);

// 3. Build
if (!QUICK) run('Build du site', bin('next'), ['build']);

// 4. Règles de texte (ce que voit un client : site, voix, e-mails, PDF)
const TEXT_DIRS = ['app', 'components', 'config', 'lib', join('voice', 'src')].map((d) => join(ROOT, d));
const textFiles = TEXT_DIRS.flatMap((d) => walk(d, ['.ts', '.tsx', '.md']))
    .filter((f) => !f.includes(join('lib', 'admin')) && !f.includes(join('components', 'admin')));

check('Jamais « relié » (règle de Solal)', () => {
    const bad: string[] = [];
    // « livre relié », « exemplaire relié », « reliure » : le sens imprimerie, pas « cases reliées par un trait ».
    const re = /(livres?|exemplaires?|ouvrages?|version|beau)\s+reli[ée]e?s?(?![\p{L}])|reliure|reli[ée]e?s?\s+(à la main|main|en toile|cousu)/iu;
    for (const f of textFiles) {
        readFileSync(f, 'utf8').split('\n').forEach((line, i) => {
            if (re.test(line)) bad.push(`${relative(ROOT, f)}:${i + 1}  ${line.trim().slice(0, 140)}`);
        });
    }
    return bad;
});

check('Prix sans « à partir de »', () => {
    const bad: string[] = [];
    for (const f of textFiles) {
        readFileSync(f, 'utf8').split('\n').forEach((line, i) => {
            if (/à partir de\s*(\$\{[^}]*price|\d{3}\s*€|449)/i.test(line)) bad.push(`${relative(ROOT, f)}:${i + 1}  ${line.trim().slice(0, 140)}`);
        });
    }
    return bad;
});

// 5. La carte
const MAP = join(ROOT, 'lib', 'admin', 'map.ts');
const mapSrc = readFileSync(MAP, 'utf8');

check('La carte : chemins « code » existants', () => {
    const missing: string[] = [];
    for (const m of mapSrc.matchAll(/code:\s*'([^']+)'/g)) {
        for (const raw of m[1].split(',')) {
            const p = raw.trim().split(/[\s:(]/)[0];
            if (p && !existsSync(join(ROOT, p))) missing.push(p);
        }
    }
    return [...new Set(missing)].map((p) => `chemin introuvable : ${p}`);
});

check('La carte : identifiants uniques', () => {
    const seen = new Map<string, number>();
    for (const m of mapSrc.matchAll(/\bid:\s*'([^']+)'/g)) seen.set(m[1], (seen.get(m[1]) ?? 0) + 1);
    return [...seen].filter(([, n]) => n > 1).map(([id, n]) => `id « ${id} » utilisé ${n} fois`);
});

check('La carte : date du dernier audit', () => {
    const node = mapSrc.split('\n').find((l) => l.includes("id: 'k-audit'"));
    if (!node) return ['case « k-audit » absente de la colonne Coulisses'];
    const m = node.match(/Dernier audit : (\d{2})\/(\d{2})\/(\d{4})/);
    if (!m) return ['case « k-audit » sans « Dernier audit : JJ/MM/AAAA »'];
    const days = (Date.now() - new Date(`${m[3]}-${m[2]}-${m[1]}`).getTime()) / 86_400_000;
    return days > 7 ? [`dernier audit il y a ${Math.floor(days)} jours`] : [];
});

const todo = (mapSrc.match(/status:\s*'todo'/g) ?? []).length;
const partial = (mapSrc.match(/status:\s*'partial'/g) ?? []).length;

// Rapport
const failed = results.filter((r) => !r.ok);
if (JSON_OUT) {
    console.log(JSON.stringify({ ok: failed.length === 0, results, map: { todo, partial } }, null, 2));
} else {
    console.log('\nAudit gratuit de Loomina\n');
    for (const r of results) {
        console.log(`${r.ok ? '✓' : '✗'} ${r.name}  (${(r.ms / 1000).toFixed(1)} s)`);
        if (!r.ok && r.detail) console.log(r.detail.split('\n').map((l) => `    ${l}`).join('\n'));
    }
    console.log(`\nLa carte : ${todo} cases « à faire », ${partial} « à surveiller ».`);
    console.log(failed.length === 0 ? '\nTout est vert.' : `\n${failed.length} contrôle(s) en échec.`);
}
process.exit(failed.length === 0 ? 0 : 1);
