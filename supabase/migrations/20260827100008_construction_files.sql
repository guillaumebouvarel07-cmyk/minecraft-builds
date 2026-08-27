-- Fichiers téléchargeables
create table construction_files (
  id uuid primary key default gen_random_uuid(),
  construction_id uuid not null references constructions(id) on delete cascade,
  file_url text not null,
  file_type file_kind not null,
  file_size integer not null
);

create index idx_files_construction on construction_files(construction_id);
