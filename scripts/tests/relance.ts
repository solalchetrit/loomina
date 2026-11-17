/**
 * OpenAI cale : la question est-elle reposée sans que la personne l'entende ?
 *
 *   npm run test:relance
 *
 * Un relais local se place entre le serveur vocal et OpenAI et laisse sans
 * réponse la toute première requête de l'appel. On attend une réplique
 * normale après un peu plus de 3 s, et non 8 s de blanc suivies de
 * « je n'ai pas bien entendu ».
 */

import './lib/env';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { startStack, stopStack, waitProcessed } from './lib/pile';
import { createAccount, cleanup } from './lib/profils';
import { simulateCall } from './lib/appel';

const PORT = 8793;
let seen = 0;

const relay = http.createServer(async (req, res) => {
    const chunks: Buffer[] = [];
    for await (const c of req) chunks.push(c as Buffer);
    seen += 1;
    if (seen === 1) return; // la première requête reste sans réponse
    const upstream = await fetch(`https://api.openai.com${req.url}`, {
        method: req.method,
        headers: { 'content-type': 'application/json', authorization: String(req.headers.authorization ?? '') },
        body: Buffer.concat(chunks),
    });
    res.writeHead(upstream.status, { 'content-type': upstream.headers.get('content-type') ?? 'application/json' });
    if (upstream.body) for await (const chunk of upstream.body as unknown as AsyncIterable<Uint8Array>) res.write(chunk);
    res.end();
});

async function main() {
    const dir = path.join(process.cwd(), 'scripts', 'tests', 'rapports', 'relance');
    fs.mkdirSync(dir, { recursive: true });
    await cleanup();
    await new Promise<void>((r) => relay.listen(PORT, r));
    await startStack(dir, { OPENAI_BASE_URL: `http://localhost:${PORT}/v1` });
    const account = await createAccount({ slug: 'relance', prenom: 'Lucie', nom: 'Marchand', prefsReglees: true }, 'relance');
    const call = await simulateCall({
        phone: account.phone,
        persona: { prenom: 'Lucie', fiche: 'Lucie Marchand, 80 ans, née à Tours.', maniere: 'Tu vouvoies. Deux phrases par réponse.', consignes: 'Après ta deuxième réponse, dis que tu dois raccrocher et raccroche sans attendre.' },
        behaviour: { maxRepliques: 3, vitesse: 20 },
    });
    await waitProcessed(call.callSid, 60_000);
    const first = call.turns.find((t) => t.role === 'loomina' && t.firstTokenMs !== undefined);
    console.log(`Première réplique après ${first?.firstTokenMs} ms : « ${first?.text.slice(0, 100)} »`);
    const ok = Boolean(first) && first!.firstTokenMs! >= 3000 && first!.firstTokenMs! < 6500 && !first!.text.includes("pas bien entendu");
    console.log(ok ? '✅ OpenAI a calé, la question a été reposée, la personne n\'a entendu qu\'une pause.' : '❌ La relance n\'a pas fonctionné.');
    await stopStack();
    relay.close();
    await cleanup();
    process.exit(ok ? 0 : 1);
}
main().catch(async (e) => { console.error(e); await stopStack(); process.exit(1); });
