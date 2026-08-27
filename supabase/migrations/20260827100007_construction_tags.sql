-- Tags d'une construction
create table construction_tags (
  construction_id uuid not null references constructions(id) on delete cascade,
  tag_id uuid not null references tags(id) on delete cascade,
  primary key (construction_id, tag_id)
);
