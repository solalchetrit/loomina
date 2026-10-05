# Serveur vocal Loomina (sans Vapi)

Remplace Vapi par **Twilio ConversationRelay** : Twilio décroche le numéro, fait la
transcription (Deepgram) et la voix (ElevenLabs), et nous envoie le texte sur un
WebSocket. Ce serveur ne fait que le cerveau (OpenAI) et renvoie les phrases.

```
Téléphone → Twilio → POST /twilio/voice   TwiML : brancher ConversationRelay
                   → WSS  /relay          prompt ⇄ text (flux), interrupt, end
                   → POST /twilio/action  fin de session
                                          → rapport (forme Vapi) → www.loomina.eu/api/vapi/webhook
                                          → call_events → Directeur → Écrivain → chapters
```

Rien ne change côté site, base et chapitres : le rapport de fin d'appel garde
exactement la forme du `end-of-call-report` de Vapi (transcript « AI: / User: »,
`artifact.messages`, `performanceMetrics`, `metadata`). La vue `call_metrics`
continue de fonctionner. Les prompts restent ceux de `system_prompts` et de
`lib/loomina/assistant.ts` (démo pour appelant inconnu comprise).

## Lancer en local

```
cd voice && npm install
cp .env.example .env   # puis remplir
npm run dev
```

Twilio doit pouvoir joindre le serveur en https/wss : en local, un tunnel
(`cloudflared tunnel --url http://localhost:8080` ou ngrok) et `PUBLIC_URL` =
l'URL du tunnel.

## Déployer (Fly.io, région Paris)

```
fly launch --no-deploy --config voice/fly.toml      # une fois
fly secrets set --config voice/fly.toml \
  NEXT_BASE_URL=https://www.loomina.eu VAPI_WEBHOOK_SECRET=… \
  TWILIO_ACCOUNT_SID=… TWILIO_AUTH_TOKEN=… TWILIO_PHONE_NUMBER=+33159169357 \
  NEXT_PUBLIC_SUPABASE_URL=… SUPABASE_SERVICE_ROLE_KEY=… OPENAI_API_KEY=…
fly deploy --config voice/fly.toml --dockerfile voice/Dockerfile   # depuis la racine du dépôt
```

Vérifier : `curl https://loomina-voice.fly.dev/health`.

## Basculer un numéro

Dans Twilio → Phone Numbers → le numéro → Voice → « A call comes in » :
Webhook `https://loomina-voice.fly.dev/twilio/voice`, méthode POST.
Pour revenir à Vapi : remettre `https://api.vapi.ai/twilio/inbound_call`.

Appels sortants depuis l'espace auteur : poser `VOICE_SERVER_URL=https://loomina-voice.fly.dev`
sur Vercel ; `/api/call` passe alors par Twilio au lieu de Vapi.

## Réglages (variables d'environnement)

| Variable | Rôle | Défaut |
|---|---|---|
| `VOICE_MODEL` | cerveau vocal OpenAI | `gpt-4.1` |
| `VOICE_TTS_VOICE` | voix ElevenLabs `voiceId[-modèle][-vitesse_stabilité_similarité]` | `Qrl71rx6Yg8RvyPYRGCQ-flash_v2_5-0.9_0.5_0.75` |
| `VOICE_LANGUAGE` | langue STT/TTS | `fr-FR` |
| `VOICE_STT_MODEL` | modèle Deepgram | `nova-3-general` |
| `VOICE_MAX_CALL_SECONDS` | durée max d'un entretien | `2700` |
| `VOICE_SILENCE_SECONDS` | silence avant relance, puis fin | `45` |

Ce que mesure chaque appel : latence du modèle (premier mot), interruptions,
tours et mots de chaque côté, tokens. Les latences voix/transcription sont
chez Twilio (Voice Insights).
