-- Prononciation du prénom par la voix de synthèse.
-- Ex. « Solal » était lu « Saulal » : on stocke une graphie phonétique
-- (« Solale ») que l'assistant vocal utilise à l'oral, sans toucher
-- au prénom réel qui reste celui du livre.
alter table public.profiles
    add column if not exists first_name_phonetic text;

comment on column public.profiles.first_name_phonetic is
    'Graphie du prénom telle que le TTS doit la lire (null = prénom tel quel).';
