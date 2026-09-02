-- Étape 14 : recherche publique + filtres combinés.
--
-- Le filtre "plusieurs matériaux, TOUS requis" est difficile à exprimer de
-- façon fiable avec de simples filtres PostgREST enchaînés (un filtre sur
-- une ressource imbriquée restreint les LIGNES embarquées, pas facilement
-- "au moins N correspondances distinctes par construction"). Plutôt que
-- bricoler ça avec plusieurs requêtes et une intersection côté application
-- (ce qui casserait aussi une pagination/count fiable), tous les filtres
-- combinés + la pagination + le total sont gérés dans une seule fonction
-- SQL, en un aller-retour.
--
-- Sécurité : SECURITY INVOKER (défaut) — la fonction s'exécute avec les
-- droits du rôle appelant (anon en pratique), donc RLS s'applique quand
-- même sur constructions/categories/tags/construction_tags/materials/
-- construction_materials en plus du filtre explicite status = 'publie'
-- ci-dessous. Double protection : même en cas d'oubli dans le WHERE, RLS
-- empêcherait déjà un brouillon de sortir.

create or replace function search_constructions(
  p_query text default null,
  p_difficulty difficulty_level default null,
  p_edition edition_type default null,
  p_category_slug text default null,
  p_tag_slug text default null,
  p_material_ids text[] default null,
  p_width_max integer default null,
  p_length_max integer default null,
  p_height_max integer default null,
  p_version text default null,
  p_sort text default 'recent',
  p_limit integer default 24,
  p_offset integer default 0
)
returns table (
  id uuid,
  slug text,
  name text,
  difficulty difficulty_level,
  edition edition_type,
  width integer,
  length integer,
  height integer,
  category_name text,
  category_slug text,
  total_count bigint
)
language sql
stable
security invoker
as $$
  select
    c.id,
    c.slug,
    c.name,
    c.difficulty,
    c.edition,
    c.width,
    c.length,
    c.height,
    cat.name as category_name,
    cat.slug as category_slug,
    count(*) over () as total_count
  from constructions c
  left join categories cat on cat.id = c.category_id
  where c.status = 'publie'
    and (p_query is null or p_query = '' or (
      c.name ilike '%' || p_query || '%'
      or c.description ilike '%' || p_query || '%'
      or c.style ilike '%' || p_query || '%'
    ))
    and (p_difficulty is null or c.difficulty = p_difficulty)
    and (p_edition is null or c.edition = p_edition)
    and (p_category_slug is null or cat.slug = p_category_slug)
    and (p_tag_slug is null or exists (
      select 1
      from construction_tags ct
      join tags t on t.id = ct.tag_id
      where ct.construction_id = c.id and t.slug = p_tag_slug
    ))
    and (
      p_material_ids is null
      or array_length(p_material_ids, 1) is null
      or (
        select count(distinct m.minecraft_id)
        from construction_materials cm
        join materials m on m.id = cm.material_id
        where cm.construction_id = c.id and m.minecraft_id = any (p_material_ids)
      ) = array_length(p_material_ids, 1)
    )
    and (p_width_max is null or c.width <= p_width_max)
    and (p_length_max is null or c.length <= p_length_max)
    and (p_height_max is null or c.height <= p_height_max)
    -- Comparaison volontairement simple (égalité exacte avec l'une des deux
    -- bornes) : min_version/max_version sont du texte libre ("1.21.4"), pas
    -- un type semver comparable. Un vrai filtre "1.20 <= x <= 1.21.4" fiable
    -- demanderait de parser/normaliser les versions (hors scope MVP) — voir
    -- le compromis détaillé dans le rapport de l'étape 14.
    and (p_version is null or p_version = '' or c.min_version = p_version or c.max_version = p_version)
  order by
    case when p_sort = 'name' then c.name end asc,
    case when p_sort = 'easiest' then
      case c.difficulty
        when 'facile' then 1
        when 'moyen' then 2
        when 'difficile' then 3
        when 'expert' then 4
      end
    end asc,
    case when p_sort is null or p_sort = 'recent' then c.created_at end desc,
    c.id
  limit greatest(p_limit, 0)
  offset greatest(p_offset, 0);
$$;

grant execute on function search_constructions to anon, authenticated;

-- Index pour les nouveaux filtres. status/category_id/difficulty/edition
-- sont déjà indexés depuis l'étape 2 ; width/length/height et
-- min_version/max_version ne le sont pas, mais restent des scans bon
-- marché sur le volume actuel — pas d'index dédié pour éviter une
-- optimisation prématurée.
create extension if not exists pg_trgm;

create index if not exists idx_constructions_name_trgm
  on constructions using gin (name gin_trgm_ops);
create index if not exists idx_constructions_description_trgm
  on constructions using gin (description gin_trgm_ops);

-- Les clés primaires composites (construction_id, tag_id) et
-- (construction_id, material_id) n'aident pas une recherche par tag_id/
-- material_id seul (elles commencent par construction_id) — utile pour le
-- filtre tag et la sous-requête de comptage des matériaux ci-dessus.
create index if not exists idx_construction_tags_tag_id
  on construction_tags(tag_id);
create index if not exists idx_construction_materials_material_id
  on construction_materials(material_id);
