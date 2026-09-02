import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Breadcrumb } from "@/components/public/Breadcrumb";
import { ConstructionGrid } from "@/components/public/ConstructionGrid";
import {
  CONSTRUCTIONS_PAGE_SIZE,
  PUBLIC_CONSTRUCTION_CARD_SELECT,
  toConstructionCardData,
  type PublicConstructionRow,
} from "@/lib/public-constructions";
import { getVerifiedConstructionsForCategory, isCategoryIndexable } from "@/lib/categories-seo";
import { absoluteUrl, jsonLdScriptProps, truncateDescription } from "@/lib/seo";
import { createPublicClient } from "@/lib/supabase/public";

/**
 * Page catégorie publique.
 *
 * Statique + ISR, comme la fiche construction : generateStaticParams()
 * pré-rend les catégories existantes au build, revalidate=60 pour le
 * reste. Lecture exclusivement via lib/supabase/public.ts (clé anon) —
 * RLS filtre déjà aux constructions publiées, jamais de service_role ici.
 */
export const revalidate = 60;

type CategoryRow = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
};

async function getCategory(slug: string) {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("categories")
    .select("id, slug, name, description")
    .eq("slug", slug)
    .maybeSingle<CategoryRow>();
  return data;
}

export async function generateStaticParams() {
  const supabase = createPublicClient();
  const { data } = await supabase.from("categories").select("slug");
  return (data ?? []).map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategory(slug);

  if (!category) return { robots: { index: false, follow: false } };

  // Étape 18 : une catégorie qui ne contient que des constructions "demo"
  // n'a pas encore de contenu réel à montrer à Google — même logique que
  // les tags (lib/categories-seo.ts, même fonction que app/sitemap.ts).
  const supabase = createPublicClient();
  const verifiedCount = (await getVerifiedConstructionsForCategory(supabase, category.id)).length;

  if (!isCategoryIndexable(verifiedCount)) {
    return { title: category.name, robots: { index: false, follow: true } };
  }

  const description = truncateDescription(
    category.description ?? `Découvre les constructions Minecraft de la catégorie ${category.name}.`,
  );
  const canonical = `/categorie/${category.slug}`;

  return {
    title: category.name,
    description,
    alternates: { canonical },
    openGraph: {
      type: "website",
      title: category.name,
      description,
      url: canonical,
    },
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = await getCategory(slug);

  if (!category) {
    notFound();
  }

  const supabase = createPublicClient();
  const { data: constructions, count } = await supabase
    .from("constructions")
    .select(PUBLIC_CONSTRUCTION_CARD_SELECT, { count: "exact" })
    .eq("category_id", category.id)
    .order("created_at", { ascending: false })
    .range(0, CONSTRUCTIONS_PAGE_SIZE - 1)
    .returns<PublicConstructionRow[]>();

  const cards = (constructions ?? []).map(toConstructionCardData);
  const total = count ?? cards.length;

  // "total" compte toutes les constructions publiées (demo incluses) —
  // c'est le nombre affiché aux visiteurs. L'indexabilité ne compte que
  // les vérifiées, requête séparée (même fonction que generateMetadata).
  const verifiedCount = (await getVerifiedConstructionsForCategory(supabase, category.id)).length;
  const indexable = isCategoryIndexable(verifiedCount);

  const breadcrumbJsonLd = indexable
    ? {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Accueil", item: absoluteUrl("/") },
          { "@type": "ListItem", position: 2, name: "Catégories", item: absoluteUrl("/#categories") },
          {
            "@type": "ListItem",
            position: 3,
            name: category.name,
            item: absoluteUrl(`/categorie/${category.slug}`),
          },
        ],
      }
    : null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      {breadcrumbJsonLd && <script {...jsonLdScriptProps(breadcrumbJsonLd)} />}

      <Breadcrumb
        items={[
          { label: "Accueil", href: "/" },
          { label: "Catégories", href: "/#categories" },
          { label: category.name },
        ]}
      />

      <h1 className="mt-4 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
        {category.name}
      </h1>

      {category.description && (
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted">{category.description}</p>
      )}

      <p className="mt-3 text-sm text-muted">
        <span className="font-medium text-fg">{total}</span> construction{total > 1 ? "s" : ""} publiée
        {total > 1 ? "s" : ""}
      </p>

      <div className="mt-8">
        <ConstructionGrid
          constructions={cards}
          emptyMessage="Aucune construction publiée dans cette catégorie pour l'instant."
        />
      </div>
    </div>
  );
}
