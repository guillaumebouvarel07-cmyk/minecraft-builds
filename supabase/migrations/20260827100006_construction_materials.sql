-- Matériaux utilisés par une construction (table de liaison + quantité)
create table construction_materials (
  construction_id uuid not null references constructions(id) on delete cascade,
  material_id uuid not null references materials(id) on delete cascade,
  quantity integer not null check (quantity > 0),
  primary key (construction_id, material_id)
);
