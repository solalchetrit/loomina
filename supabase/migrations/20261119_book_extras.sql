-- Ce qui entoure les chapitres d'un livre composé (lib/loomina/book-edition.ts,
-- EditionExtras) : la recette de composition, la passe finale, et les pièces
-- du livre (titre, sous-titre, dédicace, avant-propos, remerciements,
-- quatrième de couverture).
--
-- Ajout seul : l'ancien code ignore la colonne, et le nouveau code compose
-- quand même le livre (sans passe finale ni pièces) tant qu'elle n'existe pas.
-- Peut donc être appliquée avant ou après le déploiement.
alter table public.book_editions add column if not exists extras jsonb not null default '{}'::jsonb;

comment on column public.book_editions.extras is 'Recette, passe finale et pièces du livre (titre, dédicace, avant-propos, remerciements, 4e de couverture).';
