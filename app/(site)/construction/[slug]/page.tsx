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
import { absoluteUrl, jsonLdScriptProps, truncateDescription } from "@/lib/seo";
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
  created_at: string;
  updated_at: string;
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
       construction_files(id, original_filename, file_type, file_size),
       created_at, updated_at`,
    )
    .eq("slug", slug)
    .maybeSingle<ConstructionDetail>();

  return data;
}

function mainImageUrl(construction: ConstructionDetail): string | null {
  if (construction.construction_images.length === 0) return null;
  const sorted = [...construction.construction_images].sort((a, b) => a.position - b.position);
  return sorted[0].url;
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

  // Un slug de brouillon ou inexistant produit le même résultat (RLS ne
  // renvoie aucune ligne) : dans les deux cas, pas de metadata publiques
  // exploitables. La page elle-même appelle notFound() juste après, qui
  // prend le relais avec son propre noindex (voir not-found.tsx) — ce
  // retour explicite est une seconde barrière, pas la seule.
  if (!construction) return { robots: { index: false, follow: false } };

  const description = truncateDescription(construction.description);
  const canonical = `/construction/${construction.slug}`;
  const image = mainImageUrl(construction);

  return {
    title: construction.name,
    description,
    alternates: { canonical },
    openGraph: {
      type: "website",
      title: construction.name,
      description,
      url: canonical,
      ...(image ? { images: [{ url: image }] } : {}),
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title: construction.name,
      description,
      ...(image ? { images: [image] } : {}),
    },
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
  const canonical = absoluteUrl(`/construction/${construction.slug}`);
  const image = mainImageUrl(construction);

  const breadcrumbItems = [
    { name: "Accueil", url: absoluteUrl("/") },
    ...(construction.category
      ? [{ name: construction.category.name, url: absoluteUrl(`/categorie/${construction.category.slug}`) }]
      : []),
    { name: construction.name, url: canonical },
  ];

  // CreativeWork : la construction est un plan/modèle à reproduire dans le
  // jeu, pas un produit à vendre ni un article de blog — aucun schéma
  // schema.org plus spécifique ne correspond mieux sans forcer des
  // propriétés qui n'ont pas de sens ici (Product implique un prix,
  // Article implique un auteur éditorial). Seules les propriétés dont la
  // valeur existe réellement en base sont renseignées : aucune note, avis,
  // auteur ou prix n'est inventé.
  const constructionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: construction.name,
    description: construction.description,
    url: canonical,
    inLanguage: "fr",
    ...(image ? { image } : {}),
    dateCreated: construction.created_at,
    dateModified: construction.updated_at,
    ...(construction.category || construction.construction_tags.length > 0
      ? {
          keywords: [
            ...(construction.category ? [construction.category.name] : []),
            ...construction.construction_tags.map((t) => t.tag.name),
          ],
        }
      : {}),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbItems.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
      <script {...jsonLdScriptProps(constructionJsonLd)} />
      <script {...jsonLdScriptProps(breadcrumbJsonLd)} />

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
