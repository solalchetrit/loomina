#!/bin/bash
# Garde le serveur vocal joignable depuis ce Mac, sans intervention.
#
#   nohup bash voice/keepalive.sh > /tmp/loomina-voice-run.log 2>&1 &
#
# - lance run-local.sh (serveur + tunnel Cloudflare temporaire) ;
# - pointe le numéro Twilio sur l'URL du tunnel, avec un message de
#   secours en français si le Mac ne répond pas ;
# - vérifie l'URL publique toutes les 20 s et relance tout (nouvelle URL,
#   numéro re-pointé) après 3 échecs de suite ;
# - empêche le Mac de se mettre en veille tant qu'il tourne.
#
# Le tunnel temporaire coupe quand le réseau du Mac change ou quand
# Cloudflare le supprime : c'est ce qui a fait tomber l'appel du 04/10.
# Ce script réduit la panne à moins d'une minute ; il ne la supprime pas.
# Pour de vrais clients, il faut un hébergeur (voir fly.toml).

cd "$(dirname "$0")" || exit 1
set -a; . ../.env.local; set +a

NUMBER="${LOOMINA_NUMBER:-+33159169357}"
FALLBACK_TWIML='<Response><Say language="fr-FR" voice="Polly.Mathieu">Bonjour, ici Loumina. Je ne suis pas disponible pour le moment. Rappelez-moi dans quelques minutes, je serai là.</Say></Response>'

api() { curl -s -u "$TWILIO_ACCOUNT_SID:$TWILIO_AUTH_TOKEN" "$@"; }

number_sid() {
    api "https://api.twilio.com/2010-04-01/Accounts/$TWILIO_ACCOUNT_SID/IncomingPhoneNumbers.json?PhoneNumber=$(printf %s "$NUMBER" | sed 's/+/%2B/')" |
        python3 -c "import json,sys; print(json.load(sys.stdin)['incoming_phone_numbers'][0]['sid'])"
}

point_number() {
    local url="$1"
    local fallback
    fallback="https://twimlets.com/echo?Twiml=$(python3 -c 'import sys,urllib.parse; print(urllib.parse.quote(sys.argv[1]))' "$FALLBACK_TWIML")"
    api -X POST "https://api.twilio.com/2010-04-01/Accounts/$TWILIO_ACCOUNT_SID/IncomingPhoneNumbers/$SID.json" \
        --data-urlencode "VoiceUrl=$url/twilio/voice" -d VoiceMethod=POST \
        --data-urlencode "VoiceFallbackUrl=$fallback" -d VoiceFallbackMethod=GET >/dev/null &&
        echo "[keepalive] $(date '+%H:%M:%S') numéro → $url"
}

SID=$(number_sid) || { echo "[keepalive] numéro Twilio introuvable"; exit 1; }

# Pas de veille du Mac tant que ce script tourne.
caffeinate -is -w $$ &

RUN_PID=""
stop_run() {
    [ -n "$RUN_PID" ] && kill "$RUN_PID" 2>/dev/null
    pkill -f "cloudflared tunnel --url http://localhost:${PORT:-8080}" 2>/dev/null
    pkill -f "loomina/voice/node_modules/tsx" 2>/dev/null
    sleep 2
}
trap 'stop_run; exit' INT TERM

while true; do
    stop_run
    rm -f .public-url
    bash run-local.sh &
    RUN_PID=$!

    for _ in $(seq 1 60); do [ -s .public-url ] && break; sleep 1; done
    URL=$(cat .public-url 2>/dev/null)
    if [ -z "$URL" ]; then echo "[keepalive] pas de tunnel, nouvel essai"; continue; fi

    # Le nom du tunnel met quelques secondes à être joignable.
    for _ in $(seq 1 30); do curl -s -m 5 "$URL/health" | grep -q '"ok":true' && break; sleep 2; done
    point_number "$URL"

    fails=0
    while kill -0 "$RUN_PID" 2>/dev/null; do
        sleep 20
        if curl -s -m 8 "$URL/health" | grep -q '"ok":true'; then
            fails=0
        else
            fails=$((fails + 1))
            echo "[keepalive] $(date '+%H:%M:%S') URL publique muette ($fails/3)"
            [ "$fails" -ge 3 ] && break
        fi
    done
    echo "[keepalive] $(date '+%H:%M:%S') relance du serveur et du tunnel"
done
