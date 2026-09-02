-- Étape 17 : téléchargement public sécurisé des fichiers de construction.
--
-- increment_download_count : même philosophie étroite que
-- increment_construction_view (étape 16) — un seul paramètre (l'id de la
-- construction, jamais une valeur de compteur), l'opération +1 codée en
-- dur, aucun autre champ touché, garde explicite "status = 'publie'" en
-- seconde barrière même si la route /api/download l'a déjà vérifié en
-- amont.
--
-- Différence avec increment_construction_view : cette fonction n'est
-- JAMAIS appelée depuis le navigateur, seulement depuis la route serveur
-- /api/download/[fileId] (qui utilise déjà le client service_role pour
-- résoudre le fichier). Le seul appelant possible contourne donc déjà RLS
-- de lui-même : SECURITY DEFINER n'apporte rien ici et n'est volontairement
-- pas utilisé (surface de risque plus petite que le mode définisseur).
--
-- Choix explicite : une fonction dédiée plutôt qu'un générique du type
-- increment_counter(table, column, id) — un tel générique laisserait un
-- appelant choisir QUELLE colonne incrémenter, élargissant la surface
-- d'attaque pour économiser quelques lignes de duplication. Deux fonctions
-- étroites et à sens unique restent plus sûres qu'une seule paramétrable.
create or replace function increment_download_count(p_construction_id uuid)
returns void
language sql
security invoker
as $$
  update constructions
  set download_count = download_count + 1
  where id = p_construction_id and status = 'publie';
$$;

revoke all on function increment_download_count(uuid) from public;
grant execute on function increment_download_count(uuid) to service_role;

-- Durcissement complémentaire : la policy RLS "public_read_files_of_published"
-- (étape 2) autorise déjà la lecture de construction_files pour une
-- construction publiée, storage_path inclus. Le bucket restant privé,
-- connaître un storage_path seul ne permettait déjà pas de récupérer le
-- fichier (il faut une URL signée ou service_role) — mais l'étape 17
-- demande explicitement qu'aucun storage_path ne soit exposé au
-- navigateur, donc on retire ce droit au niveau colonne : le reste de la
-- ligne (nom, type, taille) reste lisible normalement, seul storage_path
-- devient invisible pour anon/authenticated, y compris via une requête
-- PostgREST directe qui contournerait l'app.
revoke select (storage_path) on construction_files from anon, authenticated;
