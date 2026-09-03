import type { MetadataRoute } from "next";

import { isCategoryIndexable } from "@/lib/categories-seo";
import { absoluteUrl } from "@/lib/seo";
import { createPublicClient } from "@/lib/supabase/public";
import { getVerifiedConstructionsForTag, isTagIndexable } from "@/lib/tags-seo";

// Sans ceci, Next.js met sitemap.ts en cache une fois pour toutes au build
// (comportement par défaut) : une construction publiée après le déploiement
// n'apparaîtrait alors jamais dans le sitemap avant le prochain redéploiement.
export const revalidate = 3600;

type ConstructionRow = {
  slug: string;
  updated_at: string;
  category_id: string | null;
  content_status: "demo" | "verified";
};
type CategoryRow = { id: string; slug: string };
type TagRow = { id: string; slug: string };

/** Date la plus récente d'une liste, ou undefined si la liste est vide —
 * jamais `new Date()` : un lastModified doit refléter une vraie donnée. */
function latestOf(dates: string[]): Date | undefined {
  if (dates.length === 0) return undefined;
  return new Date(dates.reduce((max, d) => (d > max ? d : max)));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createPublicClient();

  const [{ data: constructions }, { data: categories }, { data: tags }] = await Promise.all([
    supabase
      .from("constructions")
      .select("slug, updated_at, category_id, content_status")
      .order("slug")
      .returns<ConstructionRow[]>(),
    supabase.from("categories").select("id, slug").order("slug").returns<CategoryRow[]>(),
    supabase.from("tags").select("id, slug").order("slug").returns<TagRow[]>(),
  ]);

  const rows = constructions ?? [];
  // Étape 18 : seules les constructions "verified" sont indexables — une
  // fiche "demo" reste consultable mais ne doit pas apparaître dans le
  // sitemap (voir generateMetadata dans construction/[slug]/page.tsx, qui
  // applique le même critère).
  const verifiedRows = rows.filter((r) => r.content_status === "verified");

  const entries: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl("/"),
      lastModified: latestOf(rows.map((r) => r.updated_at)),
      changeFrequency: "weekly",
      priority: 1,
    },
    // Étape 21 : seule page "institutionnelle" volontairement mise en avant
    // dans le sitemap — les pages légales (mentions/confidentialité/cookies)
    // restent accessibles et indexables via le footer, mais ne sont pas
    // du contenu à faire ranker.
    {
      url: absoluteUrl("/a-propos"),
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ];

  for (const row of verifiedRows) {
    entries.push({
      url: absoluteUrl(`/construction/${row.slug}`),
      lastModified: new Date(row.updated_at),
      changeFrequency: "monthly",
      priority: 0.7,
    });
  }

  // Une catégorie qui ne contient aucune construction vérifiée n'a pas
  // encore de contenu réel à indexer (même règle que
  // generateMetadata/categorie/[slug]/page.tsx, via lib/categories-seo.ts).
  for (const category of categories ?? []) {
    const categoryVerifiedRows = verifiedRows.filter((r) => r.category_id === category.id);
    if (!isCategoryIndexable(categoryVerifiedRows.length)) continue;

    entries.push({
      url: absoluteUrl(`/categorie/${category.slug}`),
      lastModified: latestOf(categoryVerifiedRows.map((r) => r.updated_at)),
      changeFrequency: "weekly",
      priority: 0.6,
    });
  }

  // Un tag par requête (getVerifiedConstructionsForTag, la même fonction
  // qu'utilise generateMetadata dans tag/[slug]/page.tsx) plutôt qu'un
  // regroupement en mémoire : sur le volume actuel (une douzaine de tags),
  // le coût est négligeable, et c'est la seule façon de garantir que
  // sitemap et metadata appliquent EXACTEMENT la même règle — pas juste le
  // même seuil, la même requête.
  const tagEntries = await Promise.all(
    (tags ?? []).map(async (tag) => {
      const tagConstructions = await getVerifiedConstructionsForTag(supabase, tag.id);
      if (!isTagIndexable(tagConstructions.length)) return null;

      return {
        url: absoluteUrl(`/tag/${tag.slug}`),
        lastModified: latestOf(tagConstructions.map((c) => c.updated_at)),
        changeFrequency: "weekly",
        priority: 0.5,
      } satisfies MetadataRoute.Sitemap[number];
    }),
  );

  for (const entry of tagEntries) {
    if (entry) entries.push(entry);
  }

  return entries;
}
