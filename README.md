# Loomina

Biographe par téléphone : l'auteur raconte sa vie au fil d'appels, un chapitre est écrit après chaque appel, et il reçoit un livre relié.

Next.js 16 (App Router) sur Vercel, Supabase (`loomina-v2`), Vapi pour la voix, OpenAI pour l'analyse et l'écriture, Stripe pour le paiement, Twilio Verify pour la connexion par SMS.

## Le dépôt

```
app/                 pages du site et routes API (une route = un dossier)
  api/vapi/webhook   point d'entrée des appels (assistant puis fin d'appel)
  api/webhook/stripe création du compte et du projet après paiement
  api/jobs/process   rattrapage quotidien des appels non traités (cron)
  api/dev/replay     banc d'essai local : rejoue un transcript
components/          sections du site ; components/ui = briques de base
config/              textes et chiffres publics : site.ts (nom, numéro), offer.ts (prix, délais, contenu)
lib/loomina/         le cœur : phases, assistant vocal, Directeur, Écrivain, file d'événements
lib/                 utilitaires partagés (téléphone, Stripe)
supabase/migrations/ schéma de la base, dans l'ordre
docs/                architecture et historique de la mise en service v2
.claude/skills/      skills de design utilisés pour la refonte (voir SOURCES.md)
```

Une promesse faite au client (prix, délai, format) se change dans `config/offer.ts`, et nulle part ailleurs. Les CGV (`app/cgv/page.tsx`) doivent rester d'accord avec ce fichier.

## Travailler en local

```bash
npm ci
npm run dev        # http://localhost:3000
npm run check      # types + lint, à lancer avant chaque push
npm run build
```

Les variables d'environnement vivent dans Vercel. Pour le poste local, `vercel env pull .env.local`.

## Mettre en ligne

Vercel est relié au dépôt GitHub :

- une branche poussée reçoit son propre lien d'aperçu ;
- ce qui arrive sur `main` part en production sur loomina.eu.

On ne déploie donc jamais à la main : on pousse une branche, on vérifie l'aperçu, on fusionne dans `main`.

## Variables d'environnement

| Variable | Rôle |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | base de données (serveur uniquement) |
| `OPENAI_API_KEY` | Directeur et Écrivain |
| `VAPI_WEBHOOK_SECRET`, `VAPI_SERVER_URL`, `VAPI_API_KEY`, `VAPI_PHONE_NUMBER_ID` | appels entrants et sortants |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | paiement |
| `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_VERIFY_SERVICE_SID` | code SMS de connexion |
| `CONTACT_SMS_FROM`, `CONTACT_NOTIFY_PHONE` | alerte SMS du formulaire de contact |
| `JWT_SECRET` | session de l'espace auteur |
| `CRON_SECRET` | protège le rattrapage quotidien |
| `NEXT_PUBLIC_SITE_URL` | adresse publique (retour de Stripe) |
| `LOOMINA_ENABLE_DEV_ROUTES` | ouvre `/api/dev/replay` hors local |
