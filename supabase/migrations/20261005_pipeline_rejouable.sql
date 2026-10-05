-- Pipeline rejouable (audit du 05/10/2026)
--
-- 1. Un entretien par événement d'appel : un nouvel essai réutilise
--    l'entretien déjà créé au lieu d'en insérer un second.
-- 2. `claimed_at` : un traitement coupé net (fonction tuée à 300 s)
--    laissait la ligne en `processing` pour toujours. On peut désormais
--    reprendre une ligne verrouillée depuis trop longtemps.

alter table public.interviews
  add column if not exists call_event_id uuid references public.call_events(id) on delete set null;

create unique index if not exists interviews_call_event_uniq
  on public.interviews (call_event_id)
  where call_event_id is not null;

alter table public.call_events
  add column if not exists claimed_at timestamptz;

create index if not exists call_events_stuck_idx
  on public.call_events (claimed_at)
  where status = 'processing';
