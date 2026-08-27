"use client";

import { deleteConstructionImage } from "@/actions/images";
import { SubmitButton } from "@/components/admin/SubmitButton";

export function DeleteImageButton({
  id,
  constructionId,
}: {
  id: string;
  constructionId: string;
}) {
  return (
    <form
      action={deleteConstructionImage.bind(null, id, constructionId)}
      onSubmit={(event) => {
        if (!confirm("Supprimer définitivement cette image ?")) {
          event.preventDefault();
        }
      }}
    >
      <SubmitButton
        pendingLabel="…"
        className="rounded-lg border border-line px-2.5 py-1 text-xs text-red-300 transition-colors hover:border-red-900/60 hover:bg-red-950/30"
      >
        Supprimer
      </SubmitButton>
    </form>
  );
}
