/**
 * Les données d’aperçu de tous les e-mails clients (lib/emails/catalogue.ts), avec les
 * images intégrées, en JSON : de quoi construire une page d’aperçu hors du site.
 *   npx -y tsx@4.19.2 --tsconfig tsconfig.json scripts/emails/apercu.ts sortie.json
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { CATALOGUE, ETAPES, SANS_EMAIL } from '../../lib/emails/catalogue';
import { SITE_URL } from '../../lib/emails/mise-en-page';

const out = process.argv[2] ?? 'apercu-emails.json';
const cache = new Map<string, string>();
const inline = (html: string) =>
    html.replace(new RegExp(`${SITE_URL.replace(/[.]/g, '\\.')}/([\\w./-]+\\.png)`, 'g'), (_m, file: string) => {
        if (!cache.has(file)) cache.set(file, `data:image/png;base64,${readFileSync(join('public', file)).toString('base64')}`);
        return cache.get(file)!;
    });

const items = CATALOGUE.map((c) => {
    const m = c.exemple();
    return { id: c.id, etape: c.etape, nom: c.nom, quand: c.quand, aQui: c.aQui, variables: c.variables, subject: m.subject, preheader: m.preheader, html: inline(m.html) };
});
writeFileSync(out, JSON.stringify({ etapes: ETAPES, items, sans: SANS_EMAIL }));
console.log(`${items.length} e-mails → ${out}`);
