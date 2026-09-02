import type { ConstructionCardData } from "@/components/public/ConstructionCard";
import type { DifficultyLevel, EditionType } from "@/lib/types";

/** Nombre de constructions chargées par page sur les listings publics
 * (catégorie, tag...). Un simple .range() plutôt qu'un .limit() fixe, pour
 * pouvoir brancher une vraie pagination plus tard sans changer la requête. */
export const CONSTRUCTIONS_PAGE_SIZE = 24;

export type PublicConstructionRow = {
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

/** Le select() Supabase commun aux listings publics (homepage, catégorie, tag). */
export const PUBLIC_CONSTRUCTION_CARD_SELECT =
  "slug, name, difficulty, edition, width, length, height, category:categories(name, slug), construction_tags(tag:tags(name)), construction_images(url, alt_text, position)";

export function toConstructionCardData(row: PublicConstructionRow): ConstructionCardData {
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
