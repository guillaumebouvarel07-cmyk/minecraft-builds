-- Renforce au niveau PostgreSQL ce qui n'était garanti que côté application :
-- une catégorie ou un tag encore utilisé ne peut pas être supprimé.
--
-- Remplace :
--   constructions.category_id -> categories(id)   on delete set null
--   construction_tags.tag_id  -> tags(id)          on delete cascade
-- par :
--   on delete restrict (dans les deux cas)
--
-- Les contraintes sont retrouvées dynamiquement (plutôt que supposer leur nom
-- généré automatiquement) pour que cette migration reste correcte même si
-- elles ont été renommées entre-temps.

do $$
declare
  con_name text;
begin
  select tc.constraint_name into con_name
  from information_schema.table_constraints tc
  join information_schema.key_column_usage kcu
    on tc.constraint_name = kcu.constraint_name
   and tc.table_schema = kcu.table_schema
  where tc.table_schema = 'public'
    and tc.table_name = 'constructions'
    and kcu.column_name = 'category_id'
    and tc.constraint_type = 'FOREIGN KEY';

  if con_name is not null then
    execute format('alter table constructions drop constraint %I', con_name);
  end if;
end $$;

alter table constructions
  add constraint constructions_category_id_fkey
  foreign key (category_id) references categories(id) on delete restrict;

do $$
declare
  con_name text;
begin
  select tc.constraint_name into con_name
  from information_schema.table_constraints tc
  join information_schema.key_column_usage kcu
    on tc.constraint_name = kcu.constraint_name
   and tc.table_schema = kcu.table_schema
  where tc.table_schema = 'public'
    and tc.table_name = 'construction_tags'
    and kcu.column_name = 'tag_id'
    and tc.constraint_type = 'FOREIGN KEY';

  if con_name is not null then
    execute format('alter table construction_tags drop constraint %I', con_name);
  end if;
end $$;

alter table construction_tags
  add constraint construction_tags_tag_id_fkey
  foreign key (tag_id) references tags(id) on delete restrict;

-- construction_tags.construction_id garde on delete cascade (défini à
-- l'étape 2) : supprimer une construction doit toujours nettoyer ses propres
-- associations de tags, seule la table tags (catalogue global) est protégée.
