-- Étape 8 : adapte le schéma des fichiers de construction au MVP réel
-- (.litematic, .schem, .schematic) et au stockage privé.
--
-- construction_files n'a jamais été utilisée (aucune écriture avant cette
-- étape), donc pas de migration de données à gérer.

-- file_kind contenait des valeurs ambiguës/hors scope (worldedit,
-- structure_block) et pas les 3 formats réellement supportés. Recréation
-- propre plutôt que contournement (ex: caster "schem" en "worldedit").
alter table construction_files drop column file_type;
drop type file_kind;
create type file_kind as enum ('litematic', 'schem', 'schematic');
alter table construction_files add column file_type file_kind not null;

-- Stocke un chemin Storage (bucket privé, accès via URL signée plus tard)
-- plutôt qu'une URL publique figée — plus robuste si le bucket ou le
-- domaine changent, et cohérent avec le fait que les fichiers de brouillons
-- ne doivent jamais être publiquement accessibles.
alter table construction_files rename column file_url to storage_path;

-- Nom d'origine conservé uniquement comme métadonnée d'affichage (jamais
-- utilisé comme chemin Storage) + date d'ajout.
alter table construction_files
  add column original_filename text not null,
  add column created_at timestamptz not null default now();
