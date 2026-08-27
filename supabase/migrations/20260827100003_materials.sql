-- Catalogue de matériaux (référentiel réutilisable)
create table materials (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  minecraft_id text,          -- ex: "minecraft:oak_planks"
  icon_url text
);
