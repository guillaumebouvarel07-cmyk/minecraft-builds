import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Breadcrumb } from "@/components/public/Breadcrumb";
import { ConstructionGrid } from "@/components/public/ConstructionGrid";
import {
  CONSTRUCTIONS_PAGE_SIZE,
  toConstructionCardData,
  type PublicConstructionRow,
} from "@/lib/public-constructions";
import { absoluteUrl, jsonLdScriptProps } from "@/lib/seo";
import { createPublicClient } from "@/lib/supabase/public";
import { getVerifiedConstructionsForTag, isTagIndexable } from "@/lib/tags-seo";

/**
 * Page tag publique.
 *
 * Même stratégie que la page catégorie : statique + ISR, generateStaticParams()
 * au build, revalidate=60, lecture exclusivement via lib/supabase/public.ts.
 */
export const revalidate = 60;

type TagRow = {
  id: string;
  slug: string;
  name: string;
};

// construction_tags!inner force la jointure à restreindre les constructions
// retournées à celles ayant réellement ce tag (pas juste un filtre sur les
// lignes embarquées) — c'est le pattern PostgREST documenté pour ce cas.
const TAG_FILTERED_SELECT =
  "slug, name, difficulty, edition, width, length, height, category:categories(name, slug), construction_tags!inner(tag_id, tag:tags(name)), construction_images(url, alt_text, position)";

async function getTag(slug: string) {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("tags")
    .select("id, slug, name")
    .eq("slug", slug)
    .maybeSingle<TagRow>();
  return data;
}

export async function generateStaticParams() {
  const supabase = createPublicClient();
  const { data } = await supabase.from("tags").select("slug");
  return (data ?? []).map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tag = await getTag(slug);

  if (!tag) return { robots: { index: false, follow: false } };

  const supabase = createPublicClient();
  const verifiedCount = (await getVerifiedConstructionsForTag(supabase, tag.id)).length;

  // Règle centralisée dans lib/tags-seo.ts (même seuil, même requête que
  // app/sitemap.ts) : un tag avec trop peu de constructions publiées ET
  // vérifiées resterait une page quasi vide/peu fiable pour Google —
  // accessible aux visiteurs, mais hors index tant qu'il n'atteint pas le
  // seuil (les constructions "demo" ne comptent pas).
  if (!isTagIndexable(verifiedCount)) {
    return { title: tag.name, robots: { index: false, follow: true } };
  }

  const description = `Découvre les constructions Minecraft avec le tag « ${tag.name} ».`;
  const canonical = `/tag/${tag.slug}`;

  return {
    title: tag.name,
    description,
    alternates: { canonical },
    openGraph: {
      type: "website",
      title: tag.name,
      description,
      url: canonical,
    },
  };
}

export default async function TagPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tag = await getTag(slug);

  if (!tag) {
    notFound();
  }

  const supabase = createPublicClient();
  const { data: constructions, count } = await supabase
    .from("constructions")
    .select(TAG_FILTERED_SELECT, { count: "exact" })
    .eq("construction_tags.tag_id", tag.id)
    .order("created_at", { ascending: false })
    .range(0, CONSTRUCTIONS_PAGE_SIZE - 1)
    .returns<PublicConstructionRow[]>();

  const cards = (constructions ?? []).map(toConstructionCardData);
  const total = count ?? cards.length;

  // "total" (ci-dessus) compte TOUTES les constructions publiées, demo
  // incluses — c'est le nombre affiché aux visiteurs, les fiches demo
  // restant visibles dans les listings (voir le rapport de l'étape 18).
  // L'indexabilité, elle, ne doit compter que les vérifiées : requête
  // séparée, via la même fonction que generateMetadata et app/sitemap.ts.
  const verifiedCount = (await getVerifiedConstructionsForTag(supabase, tag.id)).length;
  const indexable = isTagIndexable(verifiedCount);

  // JSON-LD uniquement pour les tags indexables : pas d'intérêt à fournir
  // des données structurées pour une page qu'on demande explicitement à
  // Google de ne pas indexer.
  const breadcrumbJsonLd = indexable
    ? {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Accueil", item: absoluteUrl("/") },
          // "Tags" n'est pas un lien réel dans l'UI (pas de page /tags) :
          // on omet "item" plutôt que d'inventer une URL, comme le
          // recommande Google pour les segments non cliquables.
          { "@type": "ListItem", position: 2, name: "Tags" },
          { "@type": "ListItem", position: 3, name: tag.name, item: absoluteUrl(`/tag/${tag.slug}`) },
        ],
      }
    : null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      {breadcrumbJsonLd && <script {...jsonLdScriptProps(breadcrumbJsonLd)} />}

      <Breadcrumb
        items={[{ label: "Accueil", href: "/" }, { label: "Tags" }, { label: tag.name }]}
      />

      <h1 className="mt-4 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
        {tag.name}
      </h1>

      <p className="mt-3 text-sm text-muted">
        <span className="font-medium text-fg">{total}</span> construction{total > 1 ? "s" : ""} publiée
        {total > 1 ? "s" : ""}
      </p>

      <div className="mt-8">
        <ConstructionGrid
          constructions={cards}
          emptyMessage="Aucune construction publiée avec ce tag pour l'instant."
        />
      </div>
    </div>
  );
}
