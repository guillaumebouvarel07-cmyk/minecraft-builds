"use client";

import { useEffect } from "react";

import { trackConstructionView } from "@/lib/analytics";
import { createClient } from "@/lib/supabase/client";

type Props = {
  constructionId: string;
  constructionSlug: string;
  category: string | null;
  difficulty: string;
  edition: string;
};

/**
 * Rendu par app/(site)/construction/[slug]/page.tsx (Server Component,
 * statique + ISR). Ce composant, lui, ne s'exécute QUE dans le navigateur
 * du visiteur au montage — jamais pendant le build ou une revalidation
 * ISR, qui ne sont pas de vraies visites.
 */
export function ConstructionViewTracker({
  constructionId,
  constructionSlug,
  category,
  difficulty,
  edition,
}: Props) {
  useEffect(() => {
    trackConstructionView({ constructionId, constructionSlug, category, difficulty, edition });

    // Compteur DB : déduplication légère par onglet (StrictMode en dev,
    // retour arrière/avant) — volontairement simple, pas anti-fraude (voir
    // la migration increment_construction_view). Un échec réseau ici ne
    // doit jamais gêner le visiteur, donc pas de retry ni d'UI d'erreur.
    const storageKey = `viewed:${constructionSlug}`;
    let alreadyViewed = true;
    try {
      alreadyViewed = Boolean(window.sessionStorage.getItem(storageKey));
      if (!alreadyViewed) window.sessionStorage.setItem(storageKey, "1");
    } catch {
      alreadyViewed = false;
    }
    if (alreadyViewed) return;

    createClient()
      .rpc("increment_construction_view", { p_slug: constructionSlug })
      .then(({ error }) => {
        if (error) {
          try {
            window.sessionStorage.removeItem(storageKey);
          } catch {
            // Rien à faire : au pire le prochain montage retentera.
          }
        }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [constructionSlug]);

  return null;
}
