# Contexte de build : la racine du dépôt (le serveur importe ../lib/loomina).
FROM node:24-slim
WORKDIR /app
COPY voice/package.json voice/package-lock.json* ./voice/
RUN cd voice && npm install --omit=dev
COPY lib ./lib
COPY voice ./voice
WORKDIR /app/voice
ENV NODE_ENV=production
EXPOSE 8080
CMD ["npm", "start"]
