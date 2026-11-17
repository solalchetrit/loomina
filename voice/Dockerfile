# Contexte de build : la racine du dépôt (le serveur importe ../lib/loomina).
FROM node:24-slim
WORKDIR /app
COPY voice/package.json voice/package-lock.json* ./voice/
RUN cd voice && npm install --omit=dev
# lib/loomina importe @supabase/supabase-js, openai… : Node les cherche en
# remontant depuis /app/lib, jamais dans /app/voice. Ce lien les rend visibles.
RUN ln -s /app/voice/node_modules /app/node_modules
COPY lib ./lib
# lib/loomina lit les promesses de l'offre et les coordonnées du site.
COPY config ./config
COPY voice ./voice
WORKDIR /app/voice
ENV NODE_ENV=production
EXPOSE 8080
CMD ["npm", "start"]
