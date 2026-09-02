import type { Metadata } from "next";
import Link from "next/link";

import { ConstructionCard } from "@/components/public/ConstructionCard";
import { CategoryCard } from "@/components/public/CategoryCard";
import { Input } from "@/components/ui/Input";
import { LinkButton } from "@/components/ui/Button";
import {
  PUBLIC_CONSTRUCTION_CARD_SELECT,
  toConstructionCardData,
  type PublicConstructionRow,
} from "@/lib/public-constructions";
import { createPublicClient } from "@/lib/supabase/public";
import { site } from "@/lib/site";

/**
 * Homepage publique.
 *
 * Rendue statiquement puis revalidée toutes les 60s (ISR) : elle utilise
 * lib/supabase/public.ts (aucun appel à cookies()), donc Next.js n'a pas
 * besoin de la rendre dynamique à chaque requête. Voir la note de
 * performance dans le rapport de l'étape 11 pour le détail.
 */
export const revalidate = 60;

const homeTitle = `${site.name} — ${site.tagline}`;

// `title: { absolute }` court-circuite le template "%s · Blokprint" du
// layout racine : la homepage porte déjà le nom du site dans son titre, pas
// besoin de le dupliquer.
export const metadata: Metadata = {
  title: { absolute: homeTitle },
  description: site.description,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    title: homeTitle,
    description: site.description,
    url: "/",
  },
  twitter: {
    card: "summary",
    title: homeTitle,
    description: site.description,
  },
};

type CategoryRow = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  constructions: { count: number }[];
};

const discoveryLinks = [
  {
    label: "Faciles à construire",
    description: "Des projets accessibles pour se lancer rapidement.",
    href: "/recherche?difficulty=facile",
  },
  {
    label: "Pour la survie",
    description: "Pensées pour un usage réel en partie survie.",
    href: "/tag/survival",
  },
  {
    label: "Grandes constructions",
    description: "Des projets ambitieux pour les bâtisseurs patients.",
    href: "/tag/large",
  },
  {
    label: "Style médiéval",
    description: "Tours, forteresses et villages d'inspiration médiévale.",
    href: "/tag/medieval",
  },
  {
    label: "Style moderne",
    description: "Béton, verre et lignes épurées.",
    href: "/tag/modern",
  },
];

const valueProps = [
  { label: "Dimensions précises", description: "La taille exacte avant de poser le premier bloc." },
  { label: "Liste de matériaux", description: "Quoi rassembler, et en quelle quantité." },
  { label: "Niveau de difficulté", description: "Pour choisir un projet à la bonne échelle." },
  { label: "Compatibilité Java / Bedrock", description: "Indiquée clairement sur chaque fiche." },
  { label: "Fichier téléchargeable", description: "Quand il est disponible, en un clic." },
];

export default async function HomePage() {
  const supabase = createPublicClient();

  const [{ data: categories }, { data: constructions }, { count: totalPublished }] = await Promise.all([
    supabase
      .from("categories")
      .select("id, slug, name, description, constructions(count)")
      .order("name")
      .returns<CategoryRow[]>(),
    supabase
      .from("constructions")
      .select(PUBLIC_CONSTRUCTION_CARD_SELECT)
      .order("created_at", { ascending: false })
      .limit(8)
      .returns<PublicConstructionRow[]>(),
    supabase.from("constructions").select("*", { count: "exact", head: true }),
  ]);

  const cards = (constructions ?? []).map(toConstructionCardData);
  const categoryCount = categories?.length ?? 0;

  return (
    <div>
      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <p className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-xs font-medium text-accent">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden />
          Catalogue de démonstration
        </p>

        <h1 className="mt-6 max-w-3xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
          Trouve la construction Minecraft parfaite pour ton monde.
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
          <label htmlFor="hero-search" className="sr-only">
            Rechercher une construction
          </label>
          <Input
            id="hero-search"
            type="search"
            name="q"
            placeholder="Rechercher une construction…"
          />
          <LinkButton href="#constructions" variant="secondary" className="shrink-0">
            Voir les constructions
          </LinkButton>
        </form>

        {(totalPublished ?? 0) > 0 && (
          <p className="mt-6 text-sm text-muted">
            <span className="font-medium text-fg">{totalPublished}</span> construction
            {(totalPublished ?? 0) > 1 ? "s" : ""} publiée{(totalPublished ?? 0) > 1 ? "s" : ""} ·{" "}
            <span className="font-medium text-fg">{categoryCount}</span> catégorie
            {categoryCount > 1 ? "s" : ""}
          </p>
        )}
      </section>

      {/* Constructions en vedette */}
      <section id="constructions" className="scroll-mt-16 border-t border-line">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <h2 className="text-2xl font-semibold tracking-tight">Constructions en vedette</h2>
          <p className="mt-1.5 text-sm text-muted">Les dernières constructions ajoutées au catalogue.</p>

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
          <h2 className="text-2xl font-semibold tracking-tight">Explorer par catégorie</h2>
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
                  description={category.description}
                  count={category.constructions[0]?.count ?? 0}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Découverte par besoin */}
      <section className="border-t border-line">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <h2 className="text-2xl font-semibold tracking-tight">Trouve exactement ce qu&apos;il te faut</h2>
          <p className="mt-1.5 text-sm text-muted">Quelques points de départ courants.</p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {discoveryLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block rounded-xl border border-line bg-surface p-5 transition-colors hover:border-accent/40"
              >
                <h3 className="text-sm font-semibold text-fg">{item.label}</h3>
                <p className="mt-1.5 text-sm text-muted">{item.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Proposition de valeur */}
      <section className="border-t border-line">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <h2 className="text-2xl font-semibold tracking-tight">Ce que chaque fiche te donne</h2>
          <p className="mt-1.5 max-w-2xl text-sm text-muted">
            Au-delà d&apos;une simple image, chaque construction est documentée pour que tu saches
            exactement dans quoi tu t&apos;engages avant de commencer à poser des blocs.
          </p>

          <dl className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
            {valueProps.map((item) => (
              <div key={item.label} className="rounded-xl border border-line bg-surface p-4">
                <dt className="text-sm font-semibold text-fg">{item.label}</dt>
                <dd className="mt-1.5 text-sm text-muted">{item.description}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </div>
  );
}
