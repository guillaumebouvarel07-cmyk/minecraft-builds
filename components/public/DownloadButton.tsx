"use client";

import { useState } from "react";

import { trackFileDownload } from "@/lib/analytics";
import { Button } from "@/components/ui/Button";

type Props = {
  fileId: string;
  fileType: string;
  constructionId: string;
  constructionSlug: string;
};

type Status = "idle" | "loading" | "error";

/**
 * Le clic appelle d'abord /api/download/[fileId] (JSON, jamais un chemin
 * Storage transmis par le navigateur). trackFileDownload() n'est appelé
 * qu'APRÈS une réponse 200 confirmée — jamais de façon optimiste — pour ne
 * jamais compter dans GA4 un téléchargement refusé (brouillon, id invalide,
 * erreur serveur). Le vrai transfert de fichier se fait ensuite par une
 * navigation classique vers l'URL signée (courte durée de vie), pas par un
 * flux proxié via ce composant.
 */
export function DownloadButton({ fileId, fileType, constructionId, constructionSlug }: Props) {
  const [status, setStatus] = useState<Status>("idle");

  async function handleClick() {
    if (status === "loading") return; // évite un double déclenchement (clic + Entrée rapprochés)
    setStatus("loading");

    try {
      const response = await fetch(`/api/download/${fileId}`, { cache: "no-store" });

      if (!response.ok) {
        setStatus("error");
        return;
      }

      const { url } = (await response.json()) as { url: string };

      trackFileDownload({ constructionId, constructionSlug, fileId, fileType });
      window.location.href = url;
      setStatus("idle");
    } catch {
      setStatus("error");
    }
  }

  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={handleClick}
      disabled={status === "loading"}
      aria-busy={status === "loading"}
      className="shrink-0"
    >
      {status === "loading" ? "Préparation…" : status === "error" ? "Réessayer" : "Télécharger"}
    </Button>
  );
}
