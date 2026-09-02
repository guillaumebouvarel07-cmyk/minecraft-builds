import type { createPublicClient } from "@/lib/supabase/public";

/**
 * Règle d'indexation des tags (étape 15) : un tag n'est indexable que s'il
 * regroupe au moins ce nombre de constructions publiées. En dessous, la
 * page reste accessible aux visiteurs mais passe en noindex et disparaît
 * du sitemap — évite d'indexer des pages quasi vides pour des tags peu
 * utilisés.
 *
 * Centralisé ici et consommé à la fois par app/(site)/tag/[slug]/page.tsx
 * (metadata) et app/sitemap.ts, via la même fonction de comptage
 * ci-dessous : impossible que les deux divergent puisqu'ils font
 * littéralement la même requête.
 */
export const TAG_INDEXABLE_MIN_CONSTRUCTIONS = 2;

export function isTagIndexable(publishedCount: number): boolean {
  return publishedCount >= TAG_INDEXABLE_MIN_CONSTRUCTIONS;
}

type TagConstructionRow = {
  updated_at: string;
  construction_tags: { tag_id: string }[];
};

/**
 * Constructions publiées portant ce tag (RLS filtre déjà aux publiées via
 * lib/supabase/public.ts). Renvoie `updated_at` pour permettre à la fois
 * le comptage (indexable ou non) et un lastModified réaliste dans le
 * sitemap, à partir d'une seule et même requête.
 */
export async function getPublishedConstructionsForTag(
  supabase: ReturnType<typeof createPublicClient>,
  tagId: string,
): Promise<{ updated_at: string }[]> {
  const { data } = await supabase
    .from("constructions")
    .select("updated_at, construction_tags!inner(tag_id)")
    .eq("construction_tags.tag_id", tagId)
    .returns<TagConstructionRow[]>();

  return data ?? [];
}
