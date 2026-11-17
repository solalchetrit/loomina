-- Les prompts réécrits depuis l'admin (lib/loomina/prompt-store.ts).
--
-- Le texte d'origine de chaque prompt reste dans le code. Une ligne ici
-- remplace l'original pour la clé donnée ; la supprimer revient au texte
-- d'origine.
create table if not exists public.prompt_overrides (
    key         text primary key,
    content     text not null,
    updated_at  timestamptz not null default now()
);

-- Lu et écrit uniquement par le serveur (clé service role).
alter table public.prompt_overrides enable row level security;

comment on table public.prompt_overrides is 'Prompts réécrits depuis l''admin. Une ligne remplace le texte d''origine du code pour sa clé.';
