# Base Loomina v2 — livrée

**Projet Supabase :** `loomina-v2`
**Organisation :** Loominav2 (la tienne) · plan gratuit · **0 $/mois**
**Région :** `eu-west-3` — Paris. Tes clients sont français, la latence de l'assistant vocal compte.
**Référence :** `kazbjefnbsqubsbhrrac`
**URL :** `https://kazbjefnbsqubsbhrrac.supabase.co`

La base de production de Solal (`rgpsvvhqepbmgrdiosea`) n'a **pas** été touchée.
Le manuscrit de 18 509 caractères et les vrais transcripts y sont intacts.

---

## Ce qu'il y a dedans

Sept tables, une vue, sept déclencheurs. Le schéma est calé au champ près sur ce
que lit et écrit `lib/loomina/{db,assistant,director,writer,pipeline,events}.ts`.

| Table | Rôle |
|---|---|
| `profiles` | La personne. Miroir de `auth.users`, téléphone unique en E.164. |
| `projects` | Le livre en cours. **Une seule** colonne de phase : un entier 1-4. |
| `system_prompts` | Ce que le client entend. 4 lignes, une par phase. |
| `interviews` | Un appel, son transcript, l'analyse du Directeur. |
| `chapters` | Le manuscrit, numéroté et versionné. |
| `family_members` | Les proches cités, pour ne pas se tromper de prénom. |
| `call_events` | Journal brut des webhooks Vapi : idempotence, reprise, archive. |
| vue `project_manuscript` | Le manuscrit recomposé à la lecture. |

**Aucune colonne legacy.** Pas de `current_phase`, pas de `global_context`,
pas de `manuscript`, pas de RPC morte, pas de table fantôme.

### Trois garde-fous qui n'existaient pas avant

- `projects.stripe_session_id` **unique** — un rejeu du webhook Stripe ne peut
  plus créer un second projet.
- `projects_one_active_per_user` — un seul projet actif par personne. C'est ce
  qui faisait lever les `.maybeSingle()` de `/api/call`.
- `call_events (vapi_call_id, event_type)` **unique** — Vapi peut rejouer, le
  chapitre ne sera pas écrit deux fois.

### RLS

Activé sur les sept tables, **sans aucune policy**. C'est volontaire : personne
n'accède à la base depuis le navigateur, tout passe par les routes `/api/*` avec
la clé service role. L'audit Supabase remonte sept lignes `INFO` à ce sujet —
c'est le comportement attendu, pas un défaut. Le seul vrai avertissement
(`search_path` mutable sur la fonction du trigger) a été corrigé.

---

## Les prompts vocaux : traduits, pas copiés

Tes quatre prompts venaient de `PROMPTS/VOCAL-*.md` et utilisaient la syntaxe
Make : `{{28.first_name}}`, `{{30.global_context}}`…

Le code v2 ne lit **que** `{{nom_simple}}` — sa regex est
`\{\{\s*([a-zA-Z0-9_]+)\s*\}\}`, et le point de `28.` la fait échouer.
Copiés tels quels, tes prompts auraient fait dire à l'assistant, littéralement,
« Bonjour {{28.first_name}} ». Les six variables ont donc été traduites :

| Avant (Make) | Après (code v2) |
|---|---|
| `{{28.first_name}}` | `{{first_name}}` |
| `{{28.politeness_preference}}` | `{{politeness_preference}}` |
| `{{28.writing_style}}` | `{{writing_style}}` |
| `{{28.sensitive_topics}}` | `{{sensitive_topics}}` |
| `{{30.global_context}}` | `{{global_context}}` |
| `{{30.next_question_strategy}}` | `{{next_question_strategy}}` |

Les six correspondent exactement à ce que fournit `buildTemplateVars()`.
Vérification faite en base : **aucune variable Make résiduelle**, les quatre
prompts contiennent `{{first_name}}` et le marqueur `##END_CALL##`.

> Une coquille conservée telle quelle dans le prompt de la phase 2 : « RASTE sur
> ce sujet » (pour « RESTE »). Inoffensive pour GPT-4o, mais autant la corriger
> quand tu repasseras sur l'éditorial.

---

## Vérification exécutée

Un client fictif complet a été créé, poussé contre chaque contrainte, puis effacé.
**Les dix garde-fous ont tenu**, chacun levant une exception s'il cédait :

1. rejeu Stripe bloqué · 2. deuxième projet actif bloqué · 3. phase hors bornes
rejetée · 4. politesse invalide rejetée · 5. chaîne interview → chapitre
fonctionnelle · 6. chapitre en double bloqué · 7. rejeu Vapi bloqué · 8. vue
manuscrit compile · 9. trigger `updated_at` écrase une valeur imposée ·
10. la cascade depuis `auth.users` nettoie tout.

La base est repartie vide : 4 prompts, zéro donnée.

---

## Variables d'environnement

À poser sur Vercel (Production **et** Preview), et dans ton `.env.local` :

```
NEXT_PUBLIC_SUPABASE_URL="https://kazbjefnbsqubsbhrrac.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImthemJqZWZuYnNxdWJzYmhycmFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUyMzA3NTUsImV4cCI6MjEwMDgwNjc1NX0.g1puAtJ2zkUgRLZlX97M5gfQzXkAXH0PPUL6LIK1Hz0"
```

Et **quatre secrets que je ne peux pas générer pour toi** :

| Variable | Où la prendre | Sans elle |
|---|---|---|
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API → `service_role`, sur le projet `loomina-v2` | Le webhook v2 reste en 503. C'est *la* cause du blocage actuel. |
| `VAPI_WEBHOOK_SECRET` | `openssl rand -hex 32` | Webhook ouvert à tout internet |
| `CRON_SECRET` | `openssl rand -hex 32` | `/api/jobs/process` déclenchable par n'importe qui |
| `JWT_SECRET` | `openssl rand -hex 32` | Sessions signées avec `"fallback-secret-change-me"`, en clair sur GitHub |

Et **une variable à supprimer** : `VAPI_SERVER_URL`. Elle vaut encore une URL
`hook.eu1.make.com`, et le code lui donne la priorité sur son propre domaine —
la v2 dirait donc à Vapi de renvoyer ses rapports à Make.

---

## Les trois corrections de code encore nécessaires

Le schéma est propre ; le code, lui, s'appuie encore par endroits sur l'ancien.

**`/api/webhook/stripe` — bloquant.** Il insère `current_phase: "Vue d'ensemble"`
et `global_context`, deux colonnes qui n'existent plus. L'insert échouera, et
l'erreur est avalée par un `return {received: true}` : Stripe croira à un succès
et ton premier client de test n'aura aucun compte. À faire : `phase: 1` au lieu
de `current_phase`, supprimer `global_context`, et déplacer `stripe_session_id`
de `project_metadata` vers la colonne dédiée — c'est elle qui rend le webhook
idempotent.

**`/api/auth/verify` et `/api/user/stories`.** Ils appellent `check_client_exists()`
et `get_client_stories()`, deux RPC qui n'existent pas dans le schéma neuf. Elles
interrogeaient `Client`, `Books` et `Chapters` — disparues depuis, donc elles
étaient déjà cassées, simplement en silence. À remplacer par une lecture directe
de `profiles` et de la vue `project_manuscript` : une quinzaine de lignes chacune.

**`/api/call`.** URL Make en dur ligne 8, ID de numéro Vapi en dur ligne 7,
aucune authentification, et lecture de `current_phase`. Le plus simple est de le
neutraliser pendant les tests et de ne valider que l'appel entrant, qui est le
vrai parcours client.

---

## L'ordre à respecter

1. Poser les cinq variables sur Vercel, supprimer `VAPI_SERVER_URL`.
2. `curl -s https://www.loomina.eu/api/vapi/webhook | jq` → attendre `healthy: true`.
   Lis les cinq lignes, pas seulement le booléen : la sonde renvoie `true` même
   si `VAPI_WEBHOOK_SECRET` manque.
3. Corriger `/api/webhook/stripe` **avant** de tester un achat.
4. Basculer le Server URL du numéro Vapi vers `https://www.loomina.eu/api/vapi/webhook`,
   en notant l'ancienne URL Make — c'est le retour arrière, il prend dix secondes.
5. Appeler le +33 1 59 16 93 57. L'assistant doit t'appeler par ton prénom.
6. Deuxième appel : le chapitre 2 ne doit pas répéter le chapitre 1. C'est le test
   qui compte vraiment — c'est la correction que la v2 apporte et que Make ne faisait pas.
