-- Vue de métriques par appel, calculée à partir du rapport de fin d'appel
-- que Vapi envoie et que call_events archive tel quel (payload jsonb).
-- Rien n'est stocké en plus : la vue lit ce qui existe déjà.
--
-- Usage : select * from call_metrics order by created_at desc;

create or replace view public.call_metrics as
with base as (
    select
        e.id,
        e.created_at,
        e.vapi_call_id,
        e.project_id,
        e.status,
        e.error,
        e.payload -> 'message' as m
    from public.call_events e
    where e.event_type = 'end-of-call-report'
),
words as (
    select
        b.id,
        sum(case when msg ->> 'role' = 'user'
                 then array_length(regexp_split_to_array(trim(coalesce(msg ->> 'message', '')), '\s+'), 1) else 0 end) as user_words,
        sum(case when msg ->> 'role' = 'bot'
                 then array_length(regexp_split_to_array(trim(coalesce(msg ->> 'message', '')), '\s+'), 1) else 0 end) as bot_words,
        count(*) filter (where msg ->> 'role' = 'user') as user_turns,
        count(*) filter (where msg ->> 'role' = 'bot') as bot_turns
    from base b
    left join lateral jsonb_array_elements(coalesce(b.m -> 'artifact' -> 'messages', '[]'::jsonb)) as msg on true
    group by b.id
)
select
    b.created_at,
    b.vapi_call_id,
    b.project_id,
    b.status,
    b.error,
    b.m ->> 'endedReason'                                                       as ended_reason,
    round(extract(epoch from ((b.m ->> 'endedAt')::timestamptz - (b.m ->> 'startedAt')::timestamptz)))::int
                                                                                as duration_s,
    (b.m ->> 'cost')::numeric                                                   as cost_usd,
    (b.m -> 'costBreakdown' ->> 'stt')::numeric                                 as cost_stt,
    (b.m -> 'costBreakdown' ->> 'llm')::numeric                                 as cost_llm,
    (b.m -> 'costBreakdown' ->> 'tts')::numeric                                 as cost_tts,
    (b.m -> 'costBreakdown' ->> 'vapi')::numeric                                as cost_vapi,
    (b.m -> 'costBreakdown' ->> 'llmPromptTokens')::int                         as llm_prompt_tokens,
    round((b.m -> 'artifact' -> 'performanceMetrics' ->> 'turnLatencyAverage')::numeric)        as turn_ms,
    round((b.m -> 'artifact' -> 'performanceMetrics' ->> 'modelLatencyAverage')::numeric)       as model_ms,
    round((b.m -> 'artifact' -> 'performanceMetrics' ->> 'voiceLatencyAverage')::numeric)       as voice_ms,
    round((b.m -> 'artifact' -> 'performanceMetrics' ->> 'transcriberLatencyAverage')::numeric) as transcriber_ms,
    round((b.m -> 'artifact' -> 'performanceMetrics' ->> 'endpointingLatencyAverage')::numeric) as endpointing_ms,
    coalesce((b.m -> 'artifact' -> 'performanceMetrics' ->> 'numAssistantInterrupted')::int, 0) as interruptions,
    w.user_turns,
    w.bot_turns,
    w.user_words,
    w.bot_words,
    case when coalesce(w.user_words, 0) + coalesce(w.bot_words, 0) > 0
         then round(100.0 * w.user_words / (w.user_words + w.bot_words)) end     as user_share_pct
from base b
left join words w on w.id = b.id;

comment on view public.call_metrics is
    'Métriques par appel (durée, coût, latences, part de parole) extraites du rapport Vapi archivé dans call_events.';

-- La vue ne doit pas contourner le RLS des tables (vue SECURITY DEFINER par
-- défaut) ni être exposée par l'API publique : lecture réservée au serveur.
alter view public.call_metrics set (security_invoker = true);
revoke all on public.call_metrics from anon, authenticated;
