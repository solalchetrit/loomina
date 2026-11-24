-- Écoute des appels (demande de Solal, 24/11/2026, après le premier appel de Patricia).
--
-- 1. Les enregistrements sont copiés une fois chez nous : avant, chaque
--    lecture dans l'admin redemandait le fichier entier à Twilio (lent).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('enregistrements', 'enregistrements', false, 104857600, array['audio/mpeg'])
on conflict (id) do nothing;

-- 2. Le rapport d'écoute de chaque appel : l'audio réécouté, comparé au
--    transcript du direct, et ce qui cloche.
create table if not exists public.call_reviews (
    id uuid primary key default gen_random_uuid(),
    interview_id uuid not null unique references public.interviews(id) on delete cascade,
    status text not null default 'running' check (status in ('running', 'done', 'failed')),
    report jsonb,
    cost_usd numeric,
    error text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);
alter table public.call_reviews enable row level security;
comment on table public.call_reviews is 'Écoute d’un appel : audio réécouté, comparé au transcript, défauts relevés. Lu par l’admin seulement.';

-- 3. Les jetons dépensés par chaque composition du livre, pour le coût précis par appel.
alter table public.book_editions add column if not exists usage jsonb;
comment on column public.book_editions.usage is 'Jetons OpenAI de la composition, par modèle : { modèle: { input, cached, output } }.';
