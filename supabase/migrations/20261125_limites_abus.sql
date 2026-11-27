-- Limites anti-abus (25/11/2026, avant la mise en ligne).
--
-- 1. rate_hits + hit_rate_limit() : compteur générique « au plus N essais
--    par fenêtre » pour les formulaires du site (code SMS, contact, admin…).
--    Les lignes de plus de 2 jours sont effacées au fil de l'eau.
-- 2. demo_callers : les numéros qui ont déjà reçu leur récit de démonstration.
--    Gardé pour toujours (demo_stories est effacée après 30 jours), et le
--    numéro n'y est stocké que sous forme d'empreinte.
--
-- Lecture et écriture : clé service role seulement (RLS sans politique).

create table if not exists public.rate_hits (
    id  bigint generated always as identity primary key,
    key text not null,
    at  timestamptz not null default now()
);
create index if not exists rate_hits_key_at on public.rate_hits (key, at desc);
alter table public.rate_hits enable row level security;
revoke all on public.rate_hits from anon, authenticated;

create or replace function public.hit_rate_limit(p_key text, p_window_seconds integer, p_max integer)
returns boolean
language plpgsql
set search_path = public
as $$
declare
    n integer;
begin
    -- Deux requêtes simultanées sur la même clé ne passent pas toutes les deux.
    perform pg_advisory_xact_lock(hashtext(p_key));
    select count(*) into n from public.rate_hits
     where key = p_key and at > now() - make_interval(secs => p_window_seconds);
    if n >= p_max then
        return false;
    end if;
    insert into public.rate_hits (key) values (p_key);
    -- Ménage léger : une fois sur cinquante.
    if random() < 0.02 then
        delete from public.rate_hits where at < now() - interval '2 days';
    end if;
    return true;
end;
$$;
revoke execute on function public.hit_rate_limit(text, integer, integer) from public, anon, authenticated;
grant execute on function public.hit_rate_limit(text, integer, integer) to service_role;

create table if not exists public.demo_callers (
    phone_hash text primary key,
    recits     integer not null default 1,
    first_at   timestamptz not null default now(),
    last_at    timestamptz not null default now()
);
alter table public.demo_callers enable row level security;
revoke all on public.demo_callers from anon, authenticated;
comment on table public.demo_callers is 'Numéros (empreinte sha256) qui ont déjà reçu un récit de démonstration : une seule démo par numéro.';

-- Les démos déjà faites comptent.
insert into public.demo_callers (phone_hash, first_at, last_at)
select encode(sha256(convert_to('loomina-demo|' || phone, 'UTF8')), 'hex'), min(created_at), max(created_at)
  from public.demo_stories
 where status = 'written'
 group by phone
on conflict (phone_hash) do nothing;
