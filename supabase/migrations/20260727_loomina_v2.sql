-- ============================================================
-- Loomina v2 — Migration d'architecture
-- Date : 27/07/2026 — révision 2
--
-- PRINCIPE : ADDITIVE et NON DESTRUCTIVE.
-- Aucune colonne supprimée, aucune donnée perdue.
-- Make continue de fonctionner pendant la bascule.
-- Idempotente : rejouable sans risque.
--
-- RÉVISION 2 — correctif
--   La v1 échouait sur `projects_status_check`, une contrainte
--   préexistante qui n'autorise pas la valeur `active`.
--   Piège : ce n'était pas l'update du statut qui échouait, mais
--   le backfill de `phase`. Postgres revalide TOUTES les contraintes
--   d'une ligne dès qu'on la modifie, même sur une colonne sans
--   rapport. La ligne était déjà en infraction depuis que Make y
--   avait écrit `active`.
--   → On neutralise les anciennes contraintes AVANT toute écriture.
-- ============================================================

begin;

-- ------------------------------------------------------------
-- 0. NEUTRALISER LES ANCIENNES CONTRAINTES  ← DOIT VENIR EN PREMIER
--
-- On ne connaît pas leurs noms d'avance (`projects_status_check`
-- chez toi, mais ça peut différer). On les cherche donc par leur
-- définition plutôt que par leur nom.
-- ------------------------------------------------------------

do $$
declare c record;
begin
  for c in
    select rel.relname               as tbl,
           con.conname               as name,
           pg_get_constraintdef(con.oid) as def
    from pg_constraint con
    join pg_class     rel on rel.oid = con.conrelid
    join pg_namespace ns  on ns.oid  = rel.relnamespace
    where ns.nspname = 'public'
      and rel.relname in ('projects', 'interviews', 'chapters')
      and con.contype = 'c'
      and (
            pg_get_constraintdef(con.oid) ilike '%status%'
         or pg_get_constraintdef(con.oid) ilike '%current_phase%'
      )
  loop
    execute format('alter table public.%I drop constraint %I', c.tbl, c.name);
    raise notice 'Ancienne contrainte supprimée : %.% — %', c.tbl, c.name, c.def;
  end loop;
end $$;

-- ------------------------------------------------------------
-- 1. LES PHASES DEVIENNENT DES ENTIERS
--
-- `current_phase` était du texte libre écrit par GPT
-- (`lower(next_phase)`), comparé ailleurs à des chaînes en dur.
-- Toute divergence de casse ou d'accent cassait le routage en silence.
--
-- 1 = Vue d'ensemble · 2 = Construction
-- 3 = Accomplissements · 4 = Messages
-- ------------------------------------------------------------

alter table projects add column if not exists phase smallint;

update projects
set phase = case
  when phase is not null then phase
  when current_phase is null or btrim(current_phase) = '' then 1
  when translate(lower(current_phase),
                 'éèêëàâîïôöûü''’_-',
                 'eeeeaaiioouu   ') like '%vue d ensemble%' then 1
  when lower(current_phase) like '%construction%'    then 2
  when lower(current_phase) like '%accomplissement%' then 3
  when lower(current_phase) like '%message%'         then 4
  when lower(current_phase) like '%complet%'         then 4
  else 1
end
where phase is null;

alter table projects alter column phase set default 1;
alter table projects alter column phase set not null;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'projects_phase_range') then
    alter table projects add constraint projects_phase_range check (phase between 1 and 4);
  end if;
end $$;

-- ------------------------------------------------------------
-- 2. STATUT NORMALISÉ
--
-- Make écrivait `In_Progress` / `Completed`, le site cherchait
-- `active`. Les deux ne se rencontraient jamais.
-- ------------------------------------------------------------

update projects set status = 'active'
where status is null
   or lower(btrim(status)) in ('in_progress', 'in progress', 'en cours', 'active', 'actif');

update projects set status = 'completed'
where lower(btrim(status)) in ('completed', 'complete', 'terminé', 'termine', 'fini');

update projects set status = 'paused'
where lower(btrim(status)) in ('paused', 'en pause', 'pause');

-- Filet : toute valeur restée hors référentiel repasse en `active`
-- plutôt que de faire échouer la contrainte ajoutée juste après.
update projects set status = 'active'
where status not in ('active', 'paused', 'completed');

alter table projects alter column status set default 'active';

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'projects_status_values') then
    alter table projects add constraint projects_status_values
      check (status in ('active', 'paused', 'completed'));
  end if;
end $$;

-- ------------------------------------------------------------
-- 3. CONTEXTE STRUCTURÉ
--
-- `global_context` est un texte en append infini (déjà 6 154
-- caractères). Le modèle reçoit un mur chronologique où le récent
-- se noie dans l'ancien.
--
-- `context` le remplace : un objet JSON que le Directeur RÉÉCRIT
-- INTÉGRALEMENT à chaque appel — il peut donc fusionner, dédupliquer
-- et hiérarchiser, ce qu'un append interdit par construction.
--
-- L'ancienne colonne est conservée comme filet.
-- ------------------------------------------------------------

alter table projects add column if not exists context jsonb not null default '{}'::jsonb;

comment on column projects.context is
  'Contexte structuré réécrit intégralement par le Directeur à chaque fin d''appel. Plafonné ~1500 tokens. Remplace global_context (conservée en lecture pendant la transition).';

-- ------------------------------------------------------------
-- 4. CHAPITRES EXPLOITABLES
--
-- La table `chapters` existe depuis le début et n'a jamais reçu
-- une seule ligne. Le manuscrit est concaténé dans
-- `projects.manuscript` : pas de numérotation, pas de version,
-- une correction s'ajoute au lieu de remplacer.
-- ------------------------------------------------------------

alter table chapters add column if not exists chapter_number integer;
alter table chapters add column if not exists phase          smallint;
alter table chapters add column if not exists created_at     timestamptz not null default now();
alter table chapters add column if not exists updated_at     timestamptz not null default now();

alter table chapters alter column version set default 1;
alter table chapters alter column status  set default 'draft';

update chapters set status  = 'draft' where status is null;
update chapters set version = 1       where version is null;

-- Numérote les chapitres préexistants qui n'en auraient pas, en
-- reprenant après le plus grand numéro déjà attribué au projet.
-- Sans cela ils resteraient invisibles à `getNextChapterNumber()`
-- et mal ordonnés dans la vue manuscrit.
with base as (
    select project_id, coalesce(max(chapter_number), 0) as maxn
    from chapters
    group by project_id
),
numbered as (
    select c.id,
           b.maxn + row_number() over (
               partition by c.project_id order by c.created_at, c.id
           ) as n
    from chapters c
    join base b on b.project_id = c.project_id
    where c.chapter_number is null
)
update chapters c
set chapter_number = numbered.n
from numbered
where c.id = numbered.id;

create unique index if not exists chapters_project_number_uniq
  on chapters (project_id, chapter_number)
  where chapter_number is not null;

create index if not exists chapters_project_order_idx
  on chapters (project_id, chapter_number);

-- ------------------------------------------------------------
-- 5. JOURNAL DES ÉVÉNEMENTS VAPI
--
-- La pièce qui manquait le plus.
--   · Idempotence  : Vapi rejoue un webhook resté sans réponse.
--   · Reprise      : un échec OpenAI ne fait plus perdre l'appel
--                    d'un client à 219 €.
--   · Rejouabilité : le payload brut est conservé, donc un incident
--                    vieux de trois mois reste analysable.
--                    Make free jette ses logs au bout de 7 jours.
-- ------------------------------------------------------------

create table if not exists call_events (
  id            uuid primary key default gen_random_uuid(),
  vapi_call_id  text,
  event_type    text        not null,
  project_id    uuid        references projects (id) on delete set null,
  payload       jsonb       not null,
  status        text        not null default 'pending',
  attempts      integer     not null default 0,
  error         text,
  created_at    timestamptz not null default now(),
  processed_at  timestamptz,
  constraint call_events_status_values
    check (status in ('pending', 'processing', 'done', 'failed', 'skipped'))
);

-- LA protection anti-doublon.
create unique index if not exists call_events_dedup_uniq
  on call_events (vapi_call_id, event_type)
  where vapi_call_id is not null;

create index if not exists call_events_queue_idx
  on call_events (status, created_at)
  where status in ('pending', 'failed');

comment on table call_events is
  'Journal brut des webhooks Vapi. File d''attente, garantie d''idempotence et archive rejouable.';

-- ------------------------------------------------------------
-- 6. VERSIONNAGE DES PROMPTS VOCAUX
--
-- `system_prompts` porte ce que le client ENTEND : contenu éditorial,
-- modifiable sans redéploiement, donc il reste en base.
--
-- Les prompts du Directeur et de l'Écrivain vivent dans le code :
-- ils sont couplés au schéma JSON que le code parse. Les éditer en
-- base casserait le contrat de données en silence.
-- ------------------------------------------------------------

alter table system_prompts add column if not exists version    integer     not null default 1;
alter table system_prompts add column if not exists updated_at timestamptz not null default now();
alter table system_prompts add column if not exists phase      smallint;

update system_prompts set phase = case lower(btrim(phase_key))
  when 'vue_ensemble'     then 1
  when 'construction'     then 2
  when 'accomplissements' then 3
  when 'messages'         then 4
end
where phase is null;

create unique index if not exists system_prompts_phase_uniq
  on system_prompts (phase) where phase is not null;

-- ------------------------------------------------------------
-- 7. QUALITÉ DES INTERVIEWS
--
-- Un transcript de trois mots déclenchait toute la chaîne
-- Directeur + Écrivain et consommait des tokens pour rien.
-- ------------------------------------------------------------

alter table interviews add column if not exists phase             smallint;
alter table interviews add column if not exists processing_status text not null default 'processed';

update interviews set processing_status = 'processed'
where processing_status is null
   or processing_status not in ('pending', 'processed', 'too_short', 'failed');

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'interviews_processing_values') then
    alter table interviews add constraint interviews_processing_values
      check (processing_status in ('pending', 'processed', 'too_short', 'failed'));
  end if;
end $$;

-- ------------------------------------------------------------
-- 8. VUE DE COMPILATION DU MANUSCRIT
--
-- Le manuscrit n'est plus une colonne : il se recompose à la
-- lecture depuis les chapitres. Une réécriture remplace désormais,
-- au lieu de s'ajouter en double.
-- ------------------------------------------------------------

create or replace view project_manuscript as
select
  c.project_id,
  count(*)                       as chapter_count,
  coalesce(sum(c.word_count), 0) as total_words,
  max(c.updated_at)              as last_written_at,
  string_agg(
    '## ' || coalesce(c.title, 'Chapitre ' || c.chapter_number)
      || E'\n\n' || coalesce(c.content_markdown, ''),
    E'\n\n---\n\n' order by c.chapter_number
  )                              as manuscript
from chapters c
-- coalesce indispensable : `null <> 'archived'` vaut NULL, ce qui
-- exclurait silencieusement tout chapitre au statut non renseigné.
where coalesce(c.status, 'draft') <> 'archived'
group by c.project_id;

comment on view project_manuscript is
  'Manuscrit recomposé à la lecture depuis chapters. Remplace projects.manuscript.';

-- ------------------------------------------------------------
-- 9. MÉNAGE DANS LES RPC MORTES
--
-- `get_client_stories` et `check_client_exists` interrogent
-- "Client", "Books" et "Chapters" : trois tables supprimées depuis.
-- Elles échouent forcément à l'exécution.
-- ------------------------------------------------------------

drop function if exists get_client_stories(text);
drop function if exists check_client_exists(text);

-- `call_events` contient les transcripts bruts : jamais exposée.
alter table call_events enable row level security;
-- Aucune policy = aucun accès anon/authenticated.
-- Seule la service role key (côté serveur) y accède.

commit;

-- ============================================================
-- VÉRIFICATION — à exécuter juste après
-- ============================================================
-- select phase, status, jsonb_typeof(context) as ctx,
--        length(coalesce(global_context,'')) as ancien_contexte,
--        length(coalesce(manuscript,''))     as ancien_manuscrit
--   from projects;
--
-- select phase, phase_key, version from system_prompts order by phase;
-- select count(*) from call_events;
--
-- -- Contrôle : plus aucune ancienne contrainte de statut
-- select conname, pg_get_constraintdef(oid)
--   from pg_constraint
--  where conrelid = 'projects'::regclass and contype = 'c';
