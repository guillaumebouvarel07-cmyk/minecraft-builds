import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Breadcrumb } from "@/components/public/Breadcrumb";
import { ConstructionCard } from "@/components/public/ConstructionCard";
import { ConstructionFilesList, type FileRow } from "@/components/public/ConstructionFilesList";
import { ConstructionGallery, type GalleryImage } from "@/components/public/ConstructionGallery";
import { ConstructionMaterialsList, type MaterialRow } from "@/components/public/ConstructionMaterialsList";
import { Badge } from "@/components/ui/Badge";
import { difficultyLabels, editionLabels } from "@/lib/constructions-labels";
import {
  PUBLIC_CONSTRUCTION_CARD_SELECT,
  toConstructionCardData,
  type PublicConstructionRow,
} from "@/lib/public-constructions";
import { createPublicClient } from "@/lib/supabase/public";
import type { DifficultyLevel, EditionType } from "@/lib/types";

/**
 * Fiche construction publique.
 *
 * Statique + ISR (voir generateStaticParams/revalidate plus bas), lue via
 * lib/supabase/public.ts (aucune session, jamais la clé service_role) —
 * RLS filtre déjà aux constructions publiées ; un slug de brouillon ou
 * inexistant produit exactement le même résultat (aucune ligne), donc un
 * 404 identique dans les deux cas, sans distinction observable.
 */

export const revalidate = 60;

type ConstructionDetail = {
  id: string;
  slug: string;
  name: string;
  description: string;
  style: string | null;
  difficulty: DifficultyLevel;
  edition: EditionType;
  min_version: string;
  max_version: string | null;
  width: number | null;
  length: number | null;
  height: number | null;
  category_id: string | null;
  category: { name: string; slug: string } | null;
  construction_images: GalleryImage[];
  construction_tags: { tag: { name: string; slug: string } }[];
  construction_materials: MaterialRow[];
  construction_files: FileRow[];
};

async function getConstruction(slug: string) {
  const supabase = createPublicClient();

  const { data } = await supabase
    .from("constructions")
    .select(
      `id, slug, name, description, style, difficulty, edition, min_version, max_version,
       width, length, height, category_id,
       category:categories(name, slug),
       construction_images(id, url, alt_text, position),
       construction_tags(tag:tags(name, slug)),
       construction_materials(quantity, material:materials(name, minecraft_id, category)),
       construction_files(id, original_filename, file_type, file_size)`,
    )
    .eq("slug", slug)
    .maybeSingle<ConstructionDetail>();

  return data;
}

export async function generateStaticParams() {
  const supabase = createPublicClient();
  const { data } = await supabase.from("constructions").select("slug");
  return (data ?? []).map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const construction = await getConstruction(slug);

  if (!construction) return {};

  return {
    title: construction.name,
    description: construction.description.slice(0, 160),
  };
}

function formatVersions(min: string, max: string | null) {
  return max ? `${min} – ${max}` : `${min}+`;
}

export default async function ConstructionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const construction = await getConstruction(slug);

  if (!construction) {
    notFound();
  }

  const dimensions =
    construction.width && construction.length && construction.height
      ? `${construction.width} × ${construction.length} × ${construction.height}`
      : null;

  const supabase = createPublicClient();
  const { data: similarRows } = construction.category_id
    ? await supabase
        .from("constructions")
        .select(PUBLIC_CONSTRUCTION_CARD_SELECT)
        .eq("category_id", construction.category_id)
        .neq("id", construction.id)
        .limit(4)
        .returns<PublicConstructionRow[]>()
    : { data: [] as PublicConstructionRow[] };

  const similar = (similarRows ?? []).map(toConstructionCardData);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
      <Breadcrumb
        items={[
          { label: "Accueil", href: "/" },
          ...(construction.category
            ? [{ label: construction.category.name, href: `/categorie/${construction.category.slug}` }]
            : []),
          { label: construction.name },
        ]}
      />

      <h1 className="mt-4 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
        {construction.name}
      </h1>

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <Badge variant="accent">{difficultyLabels[construction.difficulty]}</Badge>
        <Badge variant="accent">{editionLabels[construction.edition]}</Badge>
        <Badge>{formatVersions(construction.min_version, construction.max_version)}</Badge>
        {dimensions && <Badge>{dimensions}</Badge>}
        {construction.style && <Badge>{construction.style}</Badge>}
      </div>

      {construction.construction_tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {construction.construction_tags.map(({ tag }) => (
            <Badge key={tag.slug}>{tag.name}</Badge>
          ))}
        </div>
      )}

      <div className="mt-8">
        <ConstructionGallery
          images={construction.construction_images}
          constructionName={construction.name}
        />
      </div>

      <section className="mt-10">
        <h2 className="text-xl font-semibold tracking-tight">Description</h2>
        <p className="mt-3 whitespace-pre-line text-base leading-relaxed text-muted">
          {construction.description}
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold tracking-tight">Matériaux nécessaires</h2>
        <div className="mt-4">
          <ConstructionMaterialsList materials={construction.construction_materials} />
        </div>
      </section>

      {construction.construction_files.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xl font-semibold tracking-tight">Téléchargements</h2>
          <div className="mt-4">
            <ConstructionFilesList files={construction.construction_files} />
          </div>
        </section>
      )}

      {similar.length > 0 && (
        <section className="mt-12 border-t border-line pt-10">
          <h2 className="text-xl font-semibold tracking-tight">Constructions similaires</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            {similar.map((item) => (
              <ConstructionCard key={item.slug} construction={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
