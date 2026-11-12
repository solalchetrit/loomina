/**
 * Chargement de l'environnement, sans dépendance.
 *
 * Ordre : variables déjà posées (hébergeur) > voice/.env > ../.env.local
 * (le fichier du site, pour tourner sur le Mac de Solal avec les mêmes
 * clés que Next.js). Une variable déjà définie n'est jamais écrasée.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));

function loadEnvFile(file: string): void {
    if (!fs.existsSync(file)) return;
    for (const raw of fs.readFileSync(file, 'utf8').split('\n')) {
        const line = raw.trim();
        if (!line || line.startsWith('#')) continue;
        const eq = line.indexOf('=');
        if (eq < 0) continue;
        const key = line.slice(0, eq).trim();
        let value = line.slice(eq + 1).trim();
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1);
        }
        if (process.env[key] === undefined || process.env[key] === '') {
            process.env[key] = value;
        }
    }
}

loadEnvFile(path.join(here, '..', '.env'));
loadEnvFile(path.join(here, '..', '..', '.env.local'));
