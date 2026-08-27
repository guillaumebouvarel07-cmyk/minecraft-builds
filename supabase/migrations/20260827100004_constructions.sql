-- Table centrale : constructions
create table constructions (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text not null,
  category_id uuid references categories(id) on delete set null,
  style text,
  difficulty difficulty_level not null default 'moyen',
  edition edition_type not null default 'java',
  min_version text not null,
  max_version text,
  width integer,
  length integer,
  height integer,
  status construction_status not null default 'brouillon',
  view_count integer not null default 0,      -- compteur simple, incrémenté côté serveur
  download_count integer not null default 0,  -- idem, incrémenté au téléchargement d'un fichier
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_constructions_status on constructions(status);
create index idx_constructions_category on constructions(category_id);
create index idx_constructions_difficulty on constructions(difficulty);
create index idx_constructions_edition on constructions(edition);
