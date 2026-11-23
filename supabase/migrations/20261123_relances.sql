-- Relances automatiques (demande de Solal, 23/11/2026).
--
-- 1. Démo sans commande : un rappel par e-mail deux jours avant la fin du
--    code de réduction. On garde la vraie date de fin du code (avant, un
--    second envoi du récit recalculait 14 jours à partir du jour même) et
--    le moment du rappel, pour ne l'envoyer qu'une fois.
alter table public.demo_stories add column if not exists promo_expires_at timestamptz;
alter table public.demo_stories add column if not exists promo_reminded_at timestamptz;
comment on column public.demo_stories.promo_expires_at is 'Fin de validité du code promo personnel (Stripe).';
comment on column public.demo_stories.promo_reminded_at is 'Rappel « votre réduction se termine » envoyé (ou écarté : client, code déjà utilisé).';

-- Codes créés avant cette colonne : un seul e-mail envoyé, donc le code date de cet envoi.
update public.demo_stories
   set promo_expires_at = emailed_at + interval '14 days'
 where promo_code is not null and promo_expires_at is null and email_count = 1 and emailed_at is not null;

-- 2. « Ne plus recevoir ces rappels » (paniers abandonnés, fin de réduction).
--    On ne garde pas l'adresse : seulement son empreinte signée par le site
--    (lib/loomina/optout.ts), celle qui figure dans le lien du message.
create table if not exists public.email_optouts (
    email_hash  text primary key,
    created_at  timestamptz not null default now()
);
alter table public.email_optouts enable row level security;
comment on table public.email_optouts is 'Personnes qui ne veulent plus des rappels commerciaux (empreinte HMAC de l’adresse, jamais l’adresse).';
