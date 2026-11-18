-- Les récits de la démonstration téléphonique (lib/loomina/demo-story.ts).
--
-- Un appelant inconnu fait la démo de cinq minutes. Le transcript arrive
-- ici, l'Écrivain en tire un récit, un SMS part avec un lien
-- (/recit/<token>). Sur la page du lien, la personne donne son e-mail et
-- reçoit son récit mis en page, en PDF. Rien de tout cela n'est lié à un
-- profil client. Les lignes sont effacées au bout de 30 jours.
create table if not exists public.demo_stories (
    id            uuid primary key default gen_random_uuid(),
    call_id       text not null unique,
    token         text not null unique,
    phone         text not null,
    transcript    text not null,
    duration_seconds integer,
    -- pending → written | unusable | refused | failed
    status        text not null default 'pending',
    first_name    text,
    title         text,
    content       text,
    usage         jsonb,
    error         text,
    sms_sent_at   timestamptz,
    email         text,
    email_count   integer not null default 0,
    emailed_at    timestamptz,
    created_at    timestamptz not null default now()
);

create index if not exists demo_stories_created_at_idx on public.demo_stories (created_at);

-- Lu et écrit uniquement par le serveur (clé service role).
alter table public.demo_stories enable row level security;

comment on table public.demo_stories is 'Récits de la démonstration téléphonique, envoyés par SMS puis par e-mail en PDF. Effacés après 30 jours.';
