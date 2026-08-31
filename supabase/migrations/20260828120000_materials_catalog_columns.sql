-- Étend la table materials pour un vrai catalogue (étape 6 + seed Minecraft 26.2)
create type material_category as enum (
  'wood', 'stone', 'glass', 'concrete', 'terracotta', 'wool',
  'metal', 'natural', 'lighting', 'decorative', 'functional', 'other'
);

alter table materials
  add column category material_category,
  add column version_added text,
  add column is_building_block boolean not null default true;

-- Requis pour le seed idempotent (upsert on conflict) et pour empêcher les doublons
-- créés manuellement depuis l'admin.
alter table materials
  add constraint materials_minecraft_id_key unique (minecraft_id);
