#!/bin/bash
# Fait tourner le serveur vocal sur ce Mac, joignable par Twilio via un
# tunnel Cloudflare (URL temporaire, change à chaque lancement).
#
#   bash voice/run-local.sh
#
# Affiche l'URL à coller dans Twilio (Phone Numbers → numéro → Voice →
# « A call comes in ») et la garde dans voice/.public-url.
# Ctrl-C arrête le tunnel et le serveur.

set -o pipefail
cd "$(dirname "$0")" || exit 1

PORT="${PORT:-8080}"
LOG_DIR="${TMPDIR:-/tmp}/loomina-voice"
mkdir -p "$LOG_DIR"

if ! command -v cloudflared >/dev/null; then
  echo "✗ cloudflared introuvable (installé normalement dans ~/.local/bin)"; exit 1
fi
if [ ! -d node_modules ]; then npm install; fi

cloudflared tunnel --url "http://localhost:$PORT" --no-autoupdate > "$LOG_DIR/tunnel.log" 2>&1 &
TUNNEL_PID=$!
trap 'kill $TUNNEL_PID 2>/dev/null; exit' INT TERM EXIT

PUBLIC_URL=""
for _ in $(seq 1 40); do
  PUBLIC_URL=$(grep -oE 'https://[a-z0-9-]+\.trycloudflare\.com' "$LOG_DIR/tunnel.log" | head -1)
  [ -n "$PUBLIC_URL" ] && break
  sleep 0.5
done
if [ -z "$PUBLIC_URL" ]; then echo "✗ Le tunnel n'a pas démarré (voir $LOG_DIR/tunnel.log)"; exit 1; fi

echo "$PUBLIC_URL" > .public-url
echo "▸ Tunnel : $PUBLIC_URL"
echo "▸ Webhook Twilio (A call comes in, POST) : $PUBLIC_URL/twilio/voice"
echo

PORT="$PORT" PUBLIC_URL="$PUBLIC_URL" npx tsx src/server.ts
