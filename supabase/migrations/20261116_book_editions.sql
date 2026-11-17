-- Le livre composé à part des appels (lib/loomina/book.ts).
--
-- Les récits d'appel restent dans `chapters`, jamais modifiés. Une édition
-- est le livre recomposé à partir d'eux : un plan par époques, puis les
-- chapitres écrits l'un après l'autre. La composition dure plusieurs
-- minutes : elle avance par étapes (`status`, `claimed_at`), chaque étape
-- tenant dans une fonction du site.
create table if not exists public.book_editions (
    id            uuid primary key default gen_random_uuid(),
    project_id    uuid not null references public.projects(id) on delete cascade,
    status        text not null default 'planning' check (status in ('planning', 'writing', 'ready', 'failed')),
    plan          jsonb not null default '[]'::jsonb,
    chapters      jsonb not null default '[]'::jsonb,
    source_count  integer not null default 0,
    source_words  integer not null default 0,
    error         text,
    claimed_at    timestamptz,
    created_at    timestamptz not null default now(),
    updated_at    timestamptz not null default now()
);

create index if not exists book_editions_project_idx on public.book_editions (project_id, created_at desc);

-- Lu et écrit uniquement par le serveur (clé service role) : aucune règle
-- d'accès n'est ouverte au navigateur.
alter table public.book_editions enable row level security;

comment on table public.book_editions is 'Le livre composé à partir des récits d''appel (chapters). Une ligne par composition.';
