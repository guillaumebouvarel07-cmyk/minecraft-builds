import type { createPublicClient } from "@/lib/supabase/public";

/**
 * Règle d'indexation des tags (étape 15, resserrée à l'étape 18) : un tag
 * n'est indexable que s'il regroupe au moins ce nombre de constructions
 * publiées ET vérifiées ("verified"). Une construction "demo" ne doit pas
 * servir artificiellement à rendre un tag indexable — en dessous du
 * seuil, la page reste accessible aux visiteurs mais passe en noindex et
 * disparaît du sitemap.
 *
 * Centralisé ici et consommé à la fois par app/(site)/tag/[slug]/page.tsx
 * (metadata) et app/sitemap.ts, via la même fonction de comptage
 * ci-dessous : impossible que les deux divergent puisqu'ils font
 * littéralement la même requête.
 *
 * Ne pas confondre avec le compte "toutes constructions publiées" affiché
 * sur la page tag elle-même (les demo restent visibles dans les listings,
 * voir le rapport de l'étape 18) — celui-là reste une requête séparée,
 * inchangée, dans app/(site)/tag/[slug]/page.tsx.
 */
export const TAG_INDEXABLE_MIN_CONSTRUCTIONS = 2;

export function isTagIndexable(verifiedPublishedCount: number): boolean {
  return verifiedPublishedCount >= TAG_INDEXABLE_MIN_CONSTRUCTIONS;
}

type TagConstructionRow = {
  updated_at: string;
  construction_tags: { tag_id: string }[];
};

/**
 * Constructions publiées ET vérifiées portant ce tag (RLS filtre déjà aux
 * publiées via lib/supabase/public.ts). Renvoie `updated_at` pour
 * permettre à la fois le comptage (indexable ou non) et un lastModified
 * réaliste dans le sitemap, à partir d'une seule et même requête.
 */
export async function getVerifiedConstructionsForTag(
  supabase: ReturnType<typeof createPublicClient>,
  tagId: string,
): Promise<{ updated_at: string }[]> {
  const { data } = await supabase
    .from("constructions")
    .select("updated_at, construction_tags!inner(tag_id)")
    .eq("construction_tags.tag_id", tagId)
    .eq("content_status", "verified")
    .returns<TagConstructionRow[]>();

  return data ?? [];
}
