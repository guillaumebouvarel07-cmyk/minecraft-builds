import { ConstructionCard, type ConstructionCardData } from "@/components/public/ConstructionCard";
import { CategoryCard } from "@/components/public/CategoryCard";
import { Input } from "@/components/ui/Input";
import { createClient } from "@/lib/supabase/server";
import { site } from "@/lib/site";
import type { DifficultyLevel, EditionType } from "@/lib/types";

/**
 * Page d'accueil TEMPORAIRE (étape 10).
 *
 * Sert à valider la direction visuelle et le layout public avec de vraies
 * données Supabase (lues via la clé publique, donc uniquement le contenu
 * publié). La vraie logique de homepage (mise en avant éditoriale, sections
 * dynamiques…) arrive à une étape ultérieure.
 */

type CategoryRow = {
  id: string;
  slug: string;
  name: string;
  constructions: { count: number }[];
};

type ConstructionRow = {
  slug: string;
  name: string;
  difficulty: DifficultyLevel;
  edition: EditionType;
  width: number | null;
  length: number | null;
  height: number | null;
  category: { name: string; slug: string } | null;
  construction_tags: { tag: { name: string } }[];
  construction_images: { url: string; alt_text: string | null; position: number }[];
};

function toCardData(row: ConstructionRow): ConstructionCardData {
  const sortedImages = [...row.construction_images].sort((a, b) => a.position - b.position);
  const mainImage = sortedImages[0] ?? null;

  return {
    slug: row.slug,
    name: row.name,
    difficulty: row.difficulty,
    edition: row.edition,
    width: row.width,
    length: row.length,
    height: row.height,
    category: row.category,
    tags: row.construction_tags.map((t) => t.tag.name),
    imageUrl: mainImage?.url ?? null,
    imageAlt: mainImage?.alt_text ?? null,
  };
}

export default async function HomePage() {
  const supabase = await createClient();

  const [{ data: categories }, { data: constructions }] = await Promise.all([
    supabase
      .from("categories")
      .select("id, slug, name, constructions(count)")
      .order("name")
      .returns<CategoryRow[]>(),
    supabase
      .from("constructions")
      .select(
        "slug, name, difficulty, edition, width, length, height, category:categories(name, slug), construction_tags(tag:tags(name)), construction_images(url, alt_text, position)",
      )
      .order("created_at", { ascending: false })
      .limit(8)
      .returns<ConstructionRow[]>(),
  ]);

  const cards = (constructions ?? []).map(toCardData);

  return (
    <div>
      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <p className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-xs font-medium text-accent">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden />
          Catalogue de démonstration
        </p>

        <h1 className="mt-6 max-w-3xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
          {site.tagline}
        </h1>

        <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
          {site.description}
        </p>

        <form
          id="recherche"
          method="get"
          action="/recherche"
          className="mt-8 flex max-w-lg scroll-mt-24 gap-2"
        >
          <Input
            type="search"
            name="q"
            placeholder="Rechercher une construction…"
            aria-label="Rechercher une construction"
          />
        </form>
      </section>

      {/* Constructions */}
      <section id="constructions" className="scroll-mt-16 border-t border-line">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <h2 className="text-2xl font-semibold tracking-tight">Constructions récentes</h2>
          <p className="mt-1.5 text-sm text-muted">
            Un aperçu du catalogue — {cards.length} construction{cards.length > 1 ? "s" : ""} publiée
            {cards.length > 1 ? "s" : ""}.
          </p>

          {cards.length === 0 ? (
            <p className="mt-8 text-sm text-muted">Aucune construction publiée pour l&apos;instant.</p>
          ) : (
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {cards.map((construction) => (
                <ConstructionCard key={construction.slug} construction={construction} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Catégories */}
      <section id="categories" className="scroll-mt-16 border-t border-line">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <h2 className="text-2xl font-semibold tracking-tight">Catégories</h2>
          <p className="mt-1.5 text-sm text-muted">Parcourir le catalogue par type de construction.</p>

          {!categories || categories.length === 0 ? (
            <p className="mt-8 text-sm text-muted">Aucune catégorie pour l&apos;instant.</p>
          ) : (
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {categories.map((category) => (
                <CategoryCard
                  key={category.id}
                  slug={category.slug}
                  name={category.name}
                  count={category.constructions[0]?.count ?? 0}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
