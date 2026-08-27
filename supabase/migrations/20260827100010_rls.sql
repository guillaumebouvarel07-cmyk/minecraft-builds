-- Sécurité au niveau des lignes (RLS)
alter table constructions enable row level security;
alter table construction_images enable row level security;
alter table construction_materials enable row level security;
alter table construction_tags enable row level security;
alter table construction_files enable row level security;
alter table categories enable row level security;
alter table tags enable row level security;
alter table materials enable row level security;

-- Lecture publique : uniquement le contenu publié (et les tables de référence)
create policy "public_read_published_constructions"
  on constructions for select using (status = 'publie');

create policy "public_read_categories" on categories for select using (true);
create policy "public_read_tags" on tags for select using (true);
create policy "public_read_materials" on materials for select using (true);

create policy "public_read_images_of_published" on construction_images for select
  using (exists (select 1 from constructions c where c.id = construction_id and c.status = 'publie'));

create policy "public_read_materials_of_published" on construction_materials for select
  using (exists (select 1 from constructions c where c.id = construction_id and c.status = 'publie'));

create policy "public_read_tags_of_published" on construction_tags for select
  using (exists (select 1 from constructions c where c.id = construction_id and c.status = 'publie'));

create policy "public_read_files_of_published" on construction_files for select
  using (exists (select 1 from constructions c where c.id = construction_id and c.status = 'publie'));

-- Aucune policy insert/update/delete pour le rôle public :
-- toutes les écritures passeront par le serveur avec la clé service_role (étape 3),
-- qui contourne RLS. C'est volontairement le seul mécanisme d'écriture prévu.
