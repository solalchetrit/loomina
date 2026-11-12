-- Seau privé pour les photos envoyées depuis l'espace auteur.
-- Lu et écrit uniquement par le serveur (clé service role) ; l'affichage
-- passe par des liens signés d'une heure.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('photos', 'photos', false, 4194304, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;
