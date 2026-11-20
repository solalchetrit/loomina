-- Enregistrement audio des démonstrations (demande de Solal, 20/11/2026 :
-- au lancement, on garde le son des démos pour corriger les défauts de voix).
-- Le fichier reste chez Twilio ; il est effacé avec la ligne, au bout de 30 jours.
alter table public.demo_stories add column if not exists recording_sid text;
comment on column public.demo_stories.recording_sid is 'Enregistrement Twilio (RE…) de la démo, écouté dans l’admin. Effacé chez Twilio avec la ligne.';
