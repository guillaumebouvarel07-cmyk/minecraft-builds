"use client";

import { useEffect } from "react";

import { trackFilterUsed, trackSearch } from "@/lib/analytics";

type Filters = {
  difficulty?: string;
  edition?: string;
  category?: string;
  tag?: string;
  material: string[];
};

type Props = {
  searchTerm?: string;
  filters: Filters;
};

const STORAGE_KEY = "recherche:lastFilters";

function toEntries(filters: Filters): { type: string; value: string }[] {
  const entries: { type: string; value: string }[] = [];
  if (filters.difficulty) entries.push({ type: "difficulty", value: filters.difficulty });
  if (filters.edition) entries.push({ type: "edition", value: filters.edition });
  if (filters.category) entries.push({ type: "category", value: filters.category });
  if (filters.tag) entries.push({ type: "tag", value: filters.tag });
  for (const material of filters.material) entries.push({ type: "material", value: material });
  return entries;
}

/**
 * Rendu par app/(site)/recherche/page.tsx. Deux événements distincts :
 *
 * - search : dès qu'un terme non vide est présent. Couvre à la fois la
 *   recherche de la homepage et celle de /recherche elle-même, puisque les
 *   deux formulaires GET natifs atterrissent ici — un seul point de suivi
 *   pour les deux origines (voir rapport étape 16).
 *
 * - filter_used : un événement par filtre RÉELLEMENT NOUVEAU par rapport à
 *   la dernière recherche de cet onglet, pas un par filtre actuellement en
 *   vigueur. /recherche étant un Server Component (pas de SPA persistante,
 *   chaque clic — filtre, pagination, tri — recharge entièrement la page),
 *   il n'y a pas d'état client qui survit entre deux navigations : on
 *   compare donc l'ensemble courant à un instantané gardé en
 *   sessionStorage. Ça évite qu'un simple changement de page ou de tri
 *   avec les mêmes filtres ne redéclenche des événements pour des filtres
 *   déjà comptés, tout en ne loupant aucun filtre réellement ajouté ou
 *   changé — logique volontairement simple : pas de fenêtre de temps, pas
 *   de score, juste "nouveau par rapport à la dernière fois sur cet
 *   onglet".
 */
export function RechercheAnalytics({ searchTerm, filters }: Props) {
  const materialKey = filters.material.join(",");

  useEffect(() => {
    if (searchTerm) trackSearch(searchTerm);

    const current = toEntries({ ...filters, material: materialKey ? materialKey.split(",") : [] });
    const currentKeys = current.map((entry) => `${entry.type}:${entry.value}`);

    let previousKeys: string[] = [];
    try {
      const raw = window.sessionStorage.getItem(STORAGE_KEY);
      if (raw) previousKeys = JSON.parse(raw) as string[];
    } catch {
      // sessionStorage indisponible (navigation privée stricte...) : on
      // continue sans déduplication plutôt que de casser la page.
    }
    const previousSet = new Set(previousKeys);

    for (const entry of current) {
      const key = `${entry.type}:${entry.value}`;
      if (!previousSet.has(key)) trackFilterUsed(entry.type, entry.value);
    }

    try {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(currentKeys));
    } catch {
      // Idem : pas bloquant si indisponible.
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, filters.difficulty, filters.edition, filters.category, filters.tag, materialKey]);

  return null;
}
