import type { createPublicClient } from "@/lib/supabase/public";

/**
 * Étape 18 : une catégorie qui ne contient QUE des constructions "demo"
 * n'a pas encore de contenu réel à indexer — même logique que les tags
 * (lib/tags-seo.ts), seuil différent : il suffit d'UNE construction
 * vérifiée pour qu'une catégorie ait un contenu réel à montrer à Google
 * (contrairement aux tags, une catégorie n'est pas un simple filtre
 * secondaire — c'est une section de navigation principale du site).
 *
 * Centralisé ici et consommé à la fois par
 * app/(site)/categorie/[slug]/page.tsx (metadata) et app/sitemap.ts.
 */
export function isCategoryIndexable(verifiedPublishedCount: number): boolean {
  return verifiedPublishedCount >= 1;
}

type CategoryConstructionRow = { updated_at: string };

/**
 * Constructions publiées ET vérifiées de cette catégorie (RLS filtre déjà
 * aux publiées). Ne pas confondre avec le compte "toutes publiées"
 * affiché sur la page catégorie elle-même (les demo restent visibles
 * dans les listings) — requête séparée, inchangée.
 */
export async function getVerifiedConstructionsForCategory(
  supabase: ReturnType<typeof createPublicClient>,
  categoryId: string,
): Promise<{ updated_at: string }[]> {
  const { data } = await supabase
    .from("constructions")
    .select("updated_at")
    .eq("category_id", categoryId)
    .eq("content_status", "verified")
    .returns<CategoryConstructionRow[]>();

  return data ?? [];
}
