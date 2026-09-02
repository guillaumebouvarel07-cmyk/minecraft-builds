import type { Metadata } from "next";

import { LinkButton } from "@/components/ui/Button";

/**
 * 404 du site public : construction, catégorie ou tag inexistant tombent
 * tous ici via notFound(). Next.js renvoie déjà un vrai statut HTTP 404
 * pour cette page — ce noindex explicite est une seconde barrière, dans le
 * même esprit que le RLS + vérifications applicatives utilisés ailleurs
 * dans le projet.
 */
export const metadata: Metadata = {
  title: "Page introuvable",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-24 text-center sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Page introuvable</h1>
      <p className="mt-3 text-base text-muted">
        Cette page n&apos;existe pas ou plus. Elle a peut-être été renommée ou retirée.
      </p>
      <LinkButton href="/" className="mt-8">
        Retour à l&apos;accueil
      </LinkButton>
    </div>
  );
}
