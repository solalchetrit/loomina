---
name: seo-loomina
description: Le SEO de Loomina. À charger avant d'écrire ou de modifier un article du blog (content/blog), une page guide, un titre ou une description de page, des données structurées, le plan du site ou robots, et pour tout audit SEO ou de visibilité dans ChatGPT, Perplexity et Google.
---

# SEO Loomina

Loomina est un biographe par téléphone : la personne raconte sa vie au téléphone, Loomina en fait un livre imprimé. Site : https://www.loomina.eu (Next.js, pages statiques). Public : les 65 ans et plus, et leurs enfants et petits-enfants qui offrent le livre.

Les faits sur l'offre viennent de `config/offer.ts` et `config/site.ts`. Ne jamais écrire un prix, un délai ou une promesse qui n'y figure pas.

## Ce qui existe déjà

- Métadonnées par page (titre, description, adresse canonique), Open Graph, `app/sitemap.ts`, `app/robots.ts`.
- Toute page publique déclare ses métadonnées avec `pageMeta()` (`lib/seo.ts`) : titre de 50 caractères au plus, description, adresse canonique et aperçu de partage propres à la page.
- Données structurées : Organisation et Site dans `app/layout.tsx`, Produit seulement sur l'accueil et `/offre` (`components/seo/ProductJsonLd.tsx`) ; questions sur `/faq` et les guides ; article et fil d'Ariane sur le blog.
- Pages guides (`components/guide/GuidePage.tsx`) : `/ecrire-ses-memoires`, `/cadeau-grands-parents`, `/biographe-familial`.
- Blog : un fichier Markdown par article dans `content/blog/` (mode d'emploi : `content/blog/LISEZ-MOI.md`), moteur dans `lib/blog.ts`.
- Mesure : Google Analytics et Search Console, onglet « Audience » de l'admin.

## Écrire un article du blog

### 1. Choisir le sujet

- Une recherche précise par article, celle que tape un vrai lecteur : « questions à poser à sa mère », « idée cadeau 80 ans grand-père ».
- Lire d'abord la liste des articles (`content/blog/`) et les trois guides. Jamais deux pages sur la même recherche : elles se font concurrence. Si le sujet existe, améliorer la page existante (et mettre `updated`).
- Préférer les sujets où Loomina a quelque chose de vrai à dire : faire raconter un proche, quoi demander, comment garder les souvenirs, offrir un livre de vie.
- Alterner : deux articles utiles sans rapport direct avec la vente pour un article proche de l'achat (prix, comparaison, cadeau).
- Suivre la saison : Noël, fête des grands-mères (premier dimanche de mars), fête des mères et des pères, anniversaires de 70, 80, 90 ans, noces d'or.

### 2. Structure

- Titre de 60 caractères au plus, avec les mots de la recherche au début. Description de 150 caractères environ, qui donne envie de lire.
- Premier paragraphe : la réponse complète en 40 à 60 mots. C'est ce que Google et les assistants reprennent.
- Sections `##` dont le titre ressemble à une question ou à une recherche. Chaque section se comprend seule, sans lire le reste.
- Paragraphes de deux à quatre phrases. Listes pour tout ce qui s'énumère.
- Une section « Questions fréquentes » en fin d'article, avec trois vraies questions en `###`.
- Deux ou trois liens vers le site (un guide, « Comment ça marche », un autre article), sur des mots qui disent où mène le lien.
- 700 à 1 200 mots. La longueur ne compte pas : s'arrêter quand tout est dit.

### 3. Voix

- Phrases courtes et littérales. Pas de métaphore, pas de remplissage, pas de formule d'introduction.
- Des détails concrets (un lieu, un objet, une question précise) plutôt que des généralités : c'est ce qui distingue un article utile d'un texte de machine.
- Rien d'inventé : pas de témoignage, pas de client imaginaire, pas de chiffre sans source vérifiable. Un chiffre sourcé porte son lien.
- Ne pas dénigrer les biographes ni les autres services.
- Loomina n'apparaît que là où il aide vraiment le lecteur, et jamais dans plus d'une section sur quatre. Dire que Loomina est une intelligence artificielle quand on le présente.

### 4. Règles de Solal (obligatoires)

- Jamais le mot « relié » : dire « livre » ou « livre imprimé ».
- Le prix est lu dans config/offer.ts (289 €, et 199 € en offre de lancement jusqu'au 24 décembre 2026), jamais écrit en dur, sans « à partir de ». Jamais de prix sur un bouton « Commander ».
- Pas d'application Loomina : tout se fait par téléphone.
- Lisible à 65 ans et plus.

### 5. Avant d'ouvrir la PR

- `npm run check` puis `npx next build` : l'article doit apparaître dans la liste des pages générées.
- Relire l'article une fois comme un lecteur de 70 ans, une fois comme un moteur : la réponse est-elle dans le premier paragraphe ?
- Mettre à jour le nœud `d-blog` de `lib/admin/map.ts` seulement si le fonctionnement du blog change (pas à chaque article).
- Mise en ligne : un article du blog seul (un fichier dans `content/blog`) est fusionné et mis en ligne sans attendre, une fois les vérifications vertes (accord de Solal du 27/11/2026). Tout autre changement attend que Solal écrive « déploie ».

## Auditer le site

À refaire après tout ajout de page, et une fois par mois.

1. `npx next build` puis `npx next start`, et lire chaque page publique SANS JavaScript (c'est ce que voient les robots des assistants).
2. Pour chaque page, relever : titre (60 caractères au plus avec « | Loomina », unique), description (120 à 160 caractères, unique), adresse canonique égale à l'adresse de la page, un seul `h1`, aperçu de partage (`og:title`, `og:url`) propre à la page, données structurées valides, images de contenu avec un texte alternatif (les images décoratives gardent `alt=""`).
3. Vérifier que `/sitemap.xml` liste toutes les pages publiques et aucune page privée, et que `/robots.txt` écarte `/dashboard`, `/order`, `/bienvenue`, `/admin`.
4. Vérifier les liens internes : chaque page publique reçoit au moins un lien depuis une autre page que le pied de page.
5. Ne pas toucher au haut de l'accueil (titre, module de droite) sans demande de Solal.
6. Rendre à Solal une liste courte : ce qui est corrigé, ce qui reste, ce qui dépend de lui.

## Ce qu'on ne fait pas

- Pas d'articles en masse ou sans relecture, pas de texte copié ou paraphrasé d'un autre site.
- Pas d'achat ni d'échange de liens. Les liens se gagnent : presse, annuaires sérieux, partenaires, articles qu'on a envie de citer.
- Pas de bourrage de mots-clés, pas de texte caché, pas de page par ville ou par variante sans contenu propre.
- Pas de faux avis ni de note dans les données structurées.

## Repères techniques (novembre 2026)

- Les robots de ChatGPT et de Perplexity lisent le HTML brut, sans JavaScript : tout contenu important doit être dans la page servie (c'est le cas des pages statiques).
- Google a retiré l'affichage enrichi des questions-réponses en mai 2026 : le balisage des questions reste inoffensif mais n'apporte plus d'affichage spécial. Ne pas en ajouter pour cette raison.
- `llms.txt` n'a pas d'effet démontré : ne pas le présenter comme un levier.
- Chaque page publique a un titre unique, une description, une adresse canonique, et figure dans `app/sitemap.ts`. Les pages privées (`/dashboard`, `/order`, `/admin`, `/bienvenue`) restent hors de l'index.
- Les dates d'un article sont vraies : `updated` seulement quand le fond a changé.

## Pour aller plus loin

Fiches détaillées dans `reference/` (copiées du projet libre claude-seo, en anglais) :

- `reference/contenu.md` : qualité du contenu, expérience et autorité de l'auteur.
- `reference/recherche-ia.md` : être cité par les assistants.
- `reference/donnees-structurees.md` : types de données structurées encore utiles.
- `reference/technique.md` : audit technique.

Ces fiches citent des scripts qui ne sont pas installés : faire les vérifications à la main. En cas de désaccord, les règles de cette page et celles de Solal priment.
