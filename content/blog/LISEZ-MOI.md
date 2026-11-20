# Publier un article sur le blog

Un article = un fichier `.md` dans ce dossier. Le nom du fichier devient l'adresse :
`questions-grands-parents.md` s'affiche sur `/blog/questions-grands-parents`.

## L'en-tête (obligatoire)

```
---
title: Le titre de l'article (60 caractères au plus, avec les mots que les gens tapent dans Google)
description: Une ou deux phrases qui résument l'article (150 caractères environ).
date: 2026-11-20
updated: 2026-12-05   (facultatif, quand l'article est repris)
photo: grand-pere-petite-fille   (une photo de public/photos, sans .jpg)
photoAlt: Ce que montre la photo, en une phrase.
---
```

## Le texte

- `## Titre de section`, `### Sous-titre`
- Paragraphes séparés par une ligne vide
- Listes : lignes qui commencent par `- ` ou par `1. `
- Encadré : lignes qui commencent par `> `
- `**gras**`, `*italique*`, `[lien](/offre)` ou `[lien](https://...)`

## Les règles de la maison

La méthode complète est dans `.claude/skills/seo-loomina/SKILL.md`. En bref :

- Une recherche Google précise par article. Ne pas refaire le sujet d'un guide ou d'un article existant.
- La réponse dès le premier paragraphe, en phrases courtes. Chaque section doit se comprendre seule.
- Rien d'inventé : pas de faux témoignage, pas de chiffre sans source.
- Ne promettre que ce que `config/offer.ts` et les conditions de vente couvrent.
- Jamais le mot interdit par Solal pour le livre : dire « livre » ou « livre imprimé ».
- Deux ou trois liens vers d'autres pages du site (guides, « Comment ça marche », autres articles).
