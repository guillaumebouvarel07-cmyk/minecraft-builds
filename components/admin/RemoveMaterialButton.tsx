"use client";

import { removeMaterialFromConstruction } from "@/actions/materials";
import { SubmitButton } from "@/components/admin/SubmitButton";

export function RemoveMaterialButton({
  constructionId,
  materialId,
}: {
  constructionId: string;
  materialId: string;
}) {
  return (
    <form action={removeMaterialFromConstruction.bind(null, constructionId, materialId)}>
      <SubmitButton
        pendingLabel="…"
        className="rounded-lg border border-line px-2.5 py-1 text-xs text-red-300 transition-colors hover:border-red-900/60 hover:bg-red-950/30"
      >
        Retirer
      </SubmitButton>
    </form>
  );
}
