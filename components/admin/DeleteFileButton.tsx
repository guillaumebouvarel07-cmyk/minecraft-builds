"use client";

import { deleteConstructionFile } from "@/actions/files";
import { SubmitButton } from "@/components/admin/SubmitButton";

export function DeleteFileButton({
  id,
  constructionId,
  filename,
}: {
  id: string;
  constructionId: string;
  filename: string;
}) {
  return (
    <form
      action={deleteConstructionFile.bind(null, id, constructionId)}
      onSubmit={(event) => {
        if (!confirm(`Supprimer définitivement « ${filename} » ?`)) {
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
