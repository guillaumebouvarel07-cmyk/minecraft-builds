"use client";

import { deleteConstruction } from "@/actions/constructions";
import { SubmitButton } from "@/components/admin/SubmitButton";

export function DeleteConstructionButton({ id, name }: { id: string; name: string }) {
  return (
    <form
      action={deleteConstruction.bind(null, id)}
      onSubmit={(event) => {
        if (
          !confirm(
            `Supprimer définitivement « ${name} » ? Cette action est irréversible et supprimera aussi ses images, matériaux, tags et fichiers associés.`,
          )
        ) {
          event.preventDefault();
        }
      }}
    >
      <SubmitButton
        pendingLabel="Suppression…"
        className="rounded-lg border border-line px-3 py-1.5 text-sm text-red-300 transition-colors hover:border-red-900/60 hover:bg-red-950/30"
      >
        Supprimer
      </SubmitButton>
    </form>
  );
}
