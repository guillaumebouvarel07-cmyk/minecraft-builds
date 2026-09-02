import type { Metadata } from "next";

import { Breadcrumb } from "@/components/public/Breadcrumb";
import { ConstructionGrid } from "@/components/public/ConstructionGrid";
import { MaterialAutocomplete } from "@/components/public/MaterialAutocomplete";
import type { ConstructionCardData } from "@/components/public/ConstructionCard";
import { LinkButton } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { difficultyLabels, editionLabels } from "@/lib/constructions-labels";
import { createPublicClient } from "@/lib/supabase/public";
import { SEARCH_PAGE_SIZE, parseSearchParams, type SearchParams } from "@/lib/validation/search";
import type { DifficultyLevel, EditionType } from "@/lib/types";

/**
 * Recherche publique. Volontairement NON indexable (voir metadata) et
 * rendue dynamiquement à chaque requête : contrairement à la homepage ou
 * aux fiches construction, l'espace des combinaisons de filtres possibles
 * est illimité — ISR/génération statique n'a pas de sens ici. Chaque
 * requête utilise lib/supabase/public.ts (clé anon), jamais service_role.
 */
// noindex : les résultats de recherche ne doivent jamais être indexés (une
// combinaison de filtres n'est pas un contenu, et il en existe un nombre
// illimité). follow: true en revanche — la page elle-même reste crawlable
// (voir app/robots.ts, qui ne bloque que les URLs avec query string), donc
// Google peut suivre les liens vers les fiches construction/catégorie
// qu'elle contient.
export const metadata: Metadata = {
  title: "Recherche",
  robots: { index: false, follow: true },
};

type RawSearchParams = Record<string, string | string[] | undefined>;

type SearchRow = {
  id: string;
  slug: string;
  name: string;
  difficulty: DifficultyLevel;
  edition: EditionType;
  width: number | null;
  length: number | null;
  height: number | null;
  category_name: string | null;
  category_slug: string | null;
  total_count: number;
};

type EnrichmentRow = {
  id: string;
  construction_tags: { tag: { name: string } }[];
  construction_images: { url: string; alt_text: string | null; position: number }[];
};

function buildUrl(raw: RawSearchParams, overrides: Record<string, string | string[] | null>) {
  const usp = new URLSearchParams();
  const merged: Record<string, string | string[] | null | undefined> = { ...raw, ...overrides };

  for (const [key, value] of Object.entries(merged)) {
    if (value == null) continue;
    if (Array.isArray(value)) {
      for (const v of value) if (v) usp.append(key, v);
    } else if (value !== "") {
      usp.set(key, value);
    }
  }

  const qs = usp.toString();
  return qs ? `/recherche?${qs}` : "/recherche";
}

async function runSearch(params: SearchParams) {
  const supabase = createPublicClient();
  const page = params.page ?? 1;
  const offset = (page - 1) * SEARCH_PAGE_SIZE;

  const { data, error } = (await supabase.rpc("search_constructions", {
    p_query: params.q || null,
    p_difficulty: params.difficulty ?? null,
    p_edition: params.edition ?? null,
    p_category_slug: params.category || null,
    p_tag_slug: params.tag || null,
    p_material_ids: params.material.length > 0 ? params.material : null,
    p_width_max: params.widthMax ?? null,
    p_length_max: params.lengthMax ?? null,
    p_height_max: params.heightMax ?? null,
    p_version: params.version || null,
    p_sort: params.sort ?? "recent",
    p_limit: SEARCH_PAGE_SIZE,
    p_offset: offset,
  })) as unknown as { data: SearchRow[] | null; error: unknown };

  if (error || !data) {
    return { results: [] as ConstructionCardData[], total: 0, page };
  }

  const total = data[0]?.total_count ?? 0;
  const ids = data.map((row) => row.id);

  const enrichmentById = new Map<string, EnrichmentRow>();
  if (ids.length > 0) {
    const { data: enrichRows } = await supabase
      .from("constructions")
      .select("id, construction_tags(tag:tags(name)), construction_images(url, alt_text, position)")
      .in("id", ids)
      .returns<EnrichmentRow[]>();

    for (const row of enrichRows ?? []) {
      enrichmentById.set(row.id, row);
    }
  }

  const results: ConstructionCardData[] = data.map((row) => {
    const enrichment = enrichmentById.get(row.id);
    const sortedImages = [...(enrichment?.construction_images ?? [])].sort(
      (a, b) => a.position - b.position,
    );
    const mainImage = sortedImages[0] ?? null;

    return {
      slug: row.slug,
      name: row.name,
      difficulty: row.difficulty,
      edition: row.edition,
      width: row.width,
      length: row.length,
      height: row.height,
      category:
        row.category_name && row.category_slug
          ? { name: row.category_name, slug: row.category_slug }
          : null,
      tags: (enrichment?.construction_tags ?? []).map((t) => t.tag.name),
      imageUrl: mainImage?.url ?? null,
      imageAlt: mainImage?.alt_text ?? null,
    };
  });

  return { results, total, page };
}

async function getFilterOptions() {
  const supabase = createPublicClient();
  const [{ data: categories }, { data: tags }] = await Promise.all([
    supabase.from("categories").select("slug, name").order("name"),
    supabase.from("tags").select("slug, name").order("name"),
  ]);
  return { categories: categories ?? [], tags: tags ?? [] };
}

async function getSelectedMaterialNames(minecraftIds: string[]) {
  if (minecraftIds.length === 0) return [];
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("materials")
    .select("minecraft_id, name")
    .in("minecraft_id", minecraftIds);
  return data ?? [];
}

const inputClass =
  "w-full rounded-lg border border-line bg-surface px-3.5 py-2.5 text-sm text-fg outline-none focus-visible:border-accent";
const labelClass = "block text-xs font-medium text-muted";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const raw = await searchParams;
  const params = parseSearchParams(raw);

  const [{ results, total, page }, { categories, tags }, selectedMaterials] = await Promise.all([
    runSearch(params),
    getFilterOptions(),
    getSelectedMaterialNames(params.material),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / SEARCH_PAGE_SIZE));

  // Filtres actifs -> chips retirables (calculés depuis les searchParams
  // bruts, donc toujours fidèles à l'URL réelle).
  const activeFilters: { label: string; removeHref: string }[] = [];
  if (params.q) activeFilters.push({ label: `« ${params.q} »`, removeHref: buildUrl(raw, { q: null, page: null }) });
  if (params.difficulty)
    activeFilters.push({
      label: difficultyLabels[params.difficulty],
      removeHref: buildUrl(raw, { difficulty: null, page: null }),
    });
  if (params.edition)
    activeFilters.push({
      label: editionLabels[params.edition],
      removeHref: buildUrl(raw, { edition: null, page: null }),
    });
  if (params.category) {
    const cat = categories.find((c) => c.slug === params.category);
    activeFilters.push({
      label: cat?.name ?? params.category,
      removeHref: buildUrl(raw, { category: null, page: null }),
    });
  }
  if (params.tag) {
    const t = tags.find((tg) => tg.slug === params.tag);
    activeFilters.push({ label: t?.name ?? params.tag, removeHref: buildUrl(raw, { tag: null, page: null }) });
  }
  for (const material of selectedMaterials) {
    const remaining = params.material.filter((id) => id !== material.minecraft_id);
    activeFilters.push({
      label: material.name,
      removeHref: buildUrl(raw, { material: remaining.length > 0 ? remaining : null, page: null }),
    });
  }
  if (params.widthMax)
    activeFilters.push({
      label: `Largeur ≤ ${params.widthMax}`,
      removeHref: buildUrl(raw, { widthMax: null, page: null }),
    });
  if (params.lengthMax)
    activeFilters.push({
      label: `Longueur ≤ ${params.lengthMax}`,
      removeHref: buildUrl(raw, { lengthMax: null, page: null }),
    });
  if (params.heightMax)
    activeFilters.push({
      label: `Hauteur ≤ ${params.heightMax}`,
      removeHref: buildUrl(raw, { heightMax: null, page: null }),
    });
  if (params.version)
    activeFilters.push({
      label: `Version ${params.version}`,
      removeHref: buildUrl(raw, { version: null, page: null }),
    });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <Breadcrumb items={[{ label: "Accueil", href: "/" }, { label: "Recherche" }]} />

      <h1 className="mt-4 text-3xl font-semibold tracking-tight">
        {params.q ? `Résultats pour « ${params.q} »` : "Rechercher une construction"}
      </h1>

      <details className="mt-6 rounded-xl border border-line bg-surface">
        <summary className="cursor-pointer list-none px-4 py-3 text-sm font-medium text-fg [&::-webkit-details-marker]:hidden">
          Filtres {activeFilters.length > 0 ? `(${activeFilters.length} actif${activeFilters.length > 1 ? "s" : ""})` : ""}
        </summary>

        <form method="get" action="/recherche" className="space-y-5 border-t border-line p-4">
          <div>
            <label htmlFor="q" className={labelClass}>
              Recherche
            </label>
            <Input
              id="q"
              type="search"
              name="q"
              defaultValue={params.q ?? ""}
              placeholder="Nom, description, style…"
              className="mt-1.5"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label htmlFor="difficulty" className={labelClass}>
                Difficulté
              </label>
              <select id="difficulty" name="difficulty" defaultValue={params.difficulty ?? ""} className={`${inputClass} mt-1.5`}>
                <option value="">Toutes</option>
                {Object.entries(difficultyLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="edition" className={labelClass}>
                Édition
              </label>
              <select id="edition" name="edition" defaultValue={params.edition ?? ""} className={`${inputClass} mt-1.5`}>
                <option value="">Toutes</option>
                {Object.entries(editionLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="category" className={labelClass}>
                Catégorie
              </label>
              <select id="category" name="category" defaultValue={params.category ?? ""} className={`${inputClass} mt-1.5`}>
                <option value="">Toutes</option>
                {categories.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="tag" className={labelClass}>
                Tag
              </label>
              <select id="tag" name="tag" defaultValue={params.tag ?? ""} className={`${inputClass} mt-1.5`}>
                <option value="">Tous</option>
                {tags.map((t) => (
                  <option key={t.slug} value={t.slug}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <MaterialAutocomplete initialSelected={selectedMaterials} />

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label htmlFor="widthMax" className={labelClass}>
                Largeur max
              </label>
              <input
                id="widthMax"
                name="widthMax"
                type="number"
                min={1}
                defaultValue={params.widthMax ?? ""}
                className={`${inputClass} mt-1.5`}
              />
            </div>
            <div>
              <label htmlFor="lengthMax" className={labelClass}>
                Longueur max
              </label>
              <input
                id="lengthMax"
                name="lengthMax"
                type="number"
                min={1}
                defaultValue={params.lengthMax ?? ""}
                className={`${inputClass} mt-1.5`}
              />
            </div>
            <div>
              <label htmlFor="heightMax" className={labelClass}>
                Hauteur max
              </label>
              <input
                id="heightMax"
                name="heightMax"
                type="number"
                min={1}
                defaultValue={params.heightMax ?? ""}
                className={`${inputClass} mt-1.5`}
              />
            </div>
            <div>
              <label htmlFor="version" className={labelClass}>
                Version (ex : 1.21)
              </label>
              <input
                id="version"
                name="version"
                type="text"
                defaultValue={params.version ?? ""}
                className={`${inputClass} mt-1.5`}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <label htmlFor="sort" className={labelClass}>
                Trier par
              </label>
              <select id="sort" name="sort" defaultValue={params.sort ?? "recent"} className={`${inputClass} mt-1.5`}>
                <option value="recent">Plus récentes</option>
                <option value="name">Nom A → Z</option>
                <option value="easiest">Plus faciles</option>
              </select>
            </div>

            <div className="flex gap-3">
              <LinkButton href="/recherche" variant="secondary" size="sm">
                Effacer les filtres
              </LinkButton>
              <button
                type="submit"
                className="rounded-lg bg-accent px-4 py-1.5 text-sm font-medium text-base transition-opacity hover:opacity-90"
              >
                Appliquer
              </button>
            </div>
          </div>
        </form>
      </details>

      {activeFilters.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {activeFilters.map((filter) => (
            <a
              key={filter.label}
              href={filter.removeHref}
              className="inline-flex items-center gap-1 rounded-full border border-line bg-surface px-2.5 py-1 text-xs text-fg transition-colors hover:border-accent/40"
            >
              {filter.label}
              <span aria-hidden>×</span>
            </a>
          ))}
        </div>
      )}

      <p className="mt-6 text-sm text-muted">
        <span className="font-medium text-fg">{total}</span> résultat{total > 1 ? "s" : ""}
      </p>

      <div className="mt-6">
        <ConstructionGrid
          constructions={results}
          emptyMessage="Aucune construction ne correspond à ces critères. Essaie de retirer un ou plusieurs filtres."
        />
      </div>

      {totalPages > 1 && (
        <nav aria-label="Pagination" className="mt-8 flex items-center justify-between">
          {page > 1 ? (
            <LinkButton href={buildUrl(raw, { page: String(page - 1) })} variant="secondary" size="sm">
              ← Précédent
            </LinkButton>
          ) : (
            <span />
          )}

          <span className="text-sm text-muted">
            Page {page} sur {totalPages}
          </span>

          {page < totalPages ? (
            <LinkButton href={buildUrl(raw, { page: String(page + 1) })} variant="secondary" size="sm">
              Suivant →
            </LinkButton>
          ) : (
            <span />
          )}
        </nav>
      )}
    </div>
  );
}
