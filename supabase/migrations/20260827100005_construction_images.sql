create table construction_images (
  id uuid primary key default gen_random_uuid(),
  construction_id uuid not null references constructions(id) on delete cascade,
  url text not null,
  alt_text text,
  position integer not null default 0
);

create index idx_images_construction on construction_images(construction_id);
