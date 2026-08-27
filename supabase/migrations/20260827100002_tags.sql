create table tags (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null
);
