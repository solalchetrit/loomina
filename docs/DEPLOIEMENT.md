# Loomina v2 — Mise en service

Procédure de bascule de Make vers Vercel, avec retour arrière à chaque étape.

**Principe : rien n'est supprimé tant que v2 n'a pas prouvé qu'elle fonctionne.**
Le scénario Make reste intact et réactivable en dix secondes pendant toute la bascule.

---

## Ce qui a été ajouté

```
lib/loomina/
  phases.ts       Les 4 phases — source de vérité unique (entiers, plus de texte libre)
  db.ts           Accès Supabase en service role + types du domaine
  context.ts      Contexte structuré : normalisation, plafonnement, rendu
  assistant.ts    Construction de la config vocale envoyée à Vapi
  director.ts     Le Directeur — analyse, mémoire, pilotage des phases
  writer.ts       L'Écrivain — rédaction du chapitre
  pipeline.ts     Enchaînement de la fin d'appel
  events.ts       File d'attente, idempotence, reprise sur erreur

app/api/vapi/webhook/route.ts   Point d'entrée unique de Vapi (+ sonde GET)
app/api/jobs/process/route.ts   Worker de rattrapage (cron)
app/api/dev/replay/route.ts     Banc d'essai des prompts (local uniquement)

supabase/migrations/20260727_loomina_v2.sql
docs/loomina_v2_flow.mmd        Le schéma d'architecture
vercel.json                     ⚠️ REMPLACÉ — voir la note plus bas
```

> **Note sur `vercel.json`** — l'ancien contenait uniquement `{"framework": "nextjs"}`.
> Le nouveau conserve cette ligne et ajoute le cron de rattrapage.
> Le planning est fixé à **une fois par jour (`0 3 * * *`)** : c'est la seule
> fréquence acceptée par le plan Hobby, et un planning plus fréquent **fait
> échouer le déploiement** sur ce plan. Une fois passé en Pro, remplace par
> `*/5 * * * *`.

**Aucun fichier existant n'a été modifié ni supprimé.** `/api/call`, `/api/chat`,
`lib/prompts.ts` sont toujours là. Leur nettoyage viendra après validation.

---

## Étape 1 — Variables d'environnement

Sur Vercel, **Settings → Environment Variables**, pour Production et Preview :

| Variable | Rôle | Déjà présente ? |
|---|---|---|
| `SUPABASE_SERVICE_ROLE_KEY` | Lecture des profils sans blocage RLS | ❌ **manquante — c'est elle qui faisait échouer `/api/call`** |
| `VAPI_WEBHOOK_SECRET` | Ferme le webhook. À inventer, puis coller côté Vapi. | ❌ à créer |
| `CRON_SECRET` | Protège `/api/jobs/process` | ❌ à créer |
| `VAPI_SERVER_URL` | *Optionnel.* À défaut, déduit de l'URL de la requête. | — |
| `NEXT_PUBLIC_SUPABASE_URL` | | ✅ |
| `OPENAI_API_KEY` | | ✅ |

Pour générer les deux secrets :

```bash
openssl rand -hex 32
```

> La clé service role se trouve dans Supabase → **Settings → API → service_role**.
> Elle contourne RLS : jamais dans le navigateur, jamais dans une variable `NEXT_PUBLIC_*`.

---

## Étape 2 — Migration SQL

Dans Supabase → **SQL Editor**, colle le contenu de
`supabase/migrations/20260727_loomina_v2.sql` et exécute.

La migration est **additive** : elle n'efface aucune colonne, aucune donnée.
Elle est rejouable sans risque.

Vérification :

```sql
select phase, status, jsonb_typeof(context) as ctx,
       length(coalesce(global_context,'')) as ancien_contexte
from projects;

select phase, phase_key, version from system_prompts order by phase;
select count(*) from call_events;
```

Attendu : `phase = 1`, `status = 'active'`, `ctx = 'object'`, les 4 lignes de
`system_prompts` avec leur numéro de phase, et `call_events` vide.

> **Si `system_prompts` n'a pas 4 lignes**, la bascule échouera : sans prompt
> en base, le webhook renvoie l'assistant d'accueil. À vérifier avant l'étape 4.

---

## Étape 3 — Déployer et sonder

```bash
git add . && git commit -m "feat: architecture v2 — webhook Vapi unifié"
git push
```

Puis, sans passer aucun appel :

```bash
curl -s https://www.loomina.eu/api/vapi/webhook | jq
```

Attendu :

```json
{
  "service": "loomina-vapi-webhook",
  "healthy": true,
  "checks": {
    "supabase_url": "ok",
    "service_role": "ok",
    "openai": "ok",
    "webhook_secret": "ok",
    "db": "ok"
  }
}
```

Tant que `healthy` n'est pas `true`, **ne bascule pas**. Le message indique
précisément ce qui manque.

---

## Étape 4 — La bascule

C'est le seul moment où le comportement en production change.
**Elle prend dix secondes, et se défait en dix secondes.**

Dans Vapi → **Phone Numbers** → *LOOMINA* → *Server URL* :

| | |
|---|---|
| **Avant** | `https://hook.eu1.make.com/mydskpcyeq1ttxffbu3q2vxvaazlxfjc` |
| **Après** | `https://www.loomina.eu/api/vapi/webhook` |

Ajoute l'en-tête `x-vapi-secret` avec la valeur de `VAPI_WEBHOOK_SECRET`.

**Note l'ancienne URL quelque part.** C'est ton retour arrière.

### Test

Appelle le **+33 1 59 16 93 57**, parle deux ou trois minutes, raccroche.

Puis :

```sql
select event_type, status, attempts, error, created_at, processed_at
from call_events order by created_at desc limit 5;

select chapter_number, phase, title, word_count, status
from chapters order by chapter_number desc limit 5;

select phase, phase_progress, left(next_question_strategy, 120) as prochaine_question
from projects;
```

Attendu : un `call_events` en `done`, un nouveau chapitre avec un nombre de mots
non nul, et une question suivante qui **fait référence à un fait précis de ton appel**.

Les logs détaillés sont dans Vercel → **Logs**, filtrés sur `[vapi]`.

### Retour arrière

Remets l'ancienne URL Make dans Vapi. C'est tout — le scénario Make n'a pas
été touché et reprend immédiatement.

---

## Étape 5 — Itérer sur les prompts

C'est ici que se joue la qualité du produit, et c'est ce que Make ne permettait pas.

```bash
npm run dev
```

Rejoue un appel réel déjà archivé, sans rien écrire en base :

```bash
# Récupère un id : select id from interviews order by started_at desc limit 5;
curl -s -X POST http://localhost:3000/api/dev/replay \
  -H 'Content-Type: application/json' \
  -d '{"interviewId":"<uuid>"}' | jq
```

La réponse contient la sortie complète du Directeur et de l'Écrivain, **et le
chronomètre réel** (`timings`) — à comparer au budget de 300 s de Vercel.

Boucle : modifie le prompt dans `director.ts` ou `writer.ts`, relance la commande,
compare. Quelques secondes par itération au lieu d'un appel de vingt minutes.

---

## Étape 6 — Nettoyage (seulement après une semaine de v2 sereine)

Ne fais rien de cette liste avant d'avoir vu plusieurs appels réels aboutir.

**Dans Make**
- Désactiver — sans supprimer — le scénario `LOOMINA principal`
- Supprimer les 13 webhooks orphelins (`Test`, `Test 2`, `Test 3`, `Loomina V2 Hook`,
  `Loomina Identity Verify`, `Loomina Identity Verify v2`, et les quatre
  `My gateway-webhook webhook`). C'est cette accumulation qui a produit le bug
  du webhook débranché côté site.

**Dans le code**
- `lib/prompts.ts` — doublon de `system_prompts`
- `app/api/chat/` et `app/api/chat/end/` — interrogent une table `users` qui n'existe pas
- Dans `app/api/call/route.ts` : l'URL Make en dur ligne 8

**Dans Supabase**
- `projects.manuscript` et `projects.global_context`, une fois le manuscrit
  existant (18 509 caractères) découpé en chapitres

**Dans Git**
- Le `.venv` Python commité (11 000+ fichiers)

---

## Ce qui reste à décider ensemble

1. **Le manuscrit historique.** 18 509 caractères dans `projects.manuscript`.
   Faut-il le découper en chapitres à la main, demander à l'Écrivain de le
   redécouper, ou le garder comme chapitre 0 ?

2. **Le plan Supabase.** Le passage en Pro est le seul point non négociable :
   la mise en pause automatique a déjà causé un arrêt complet du service.

3. **Le mode sortant.** `/api/call` déclenche des appels depuis le site avec un
   assistant construit *inline*, donc sans passer par `assistant-request`.
   Il devrait réutiliser `buildAssistant()` pour qu'il n'existe qu'une seule
   définition de l'assistant. Non fait ici : je n'ai pas voulu modifier une route
   en production dans le même lot.
