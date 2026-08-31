"use client";

import { useActionState } from "react";

import { updateMaterialQuantity } from "@/actions/materials";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { initialMaterialActionState } from "@/lib/validation/material";

export function QuantityEditForm({
  constructionId,
  materialId,
  quantity,
}: {
  constructionId: string;
  materialId: string;
  quantity: number;
}) {
  const action = updateMaterialQuantity.bind(null, constructionId, materialId);
  const [state, formAction] = useActionState(action, initialMaterialActionState);

  return (
    <div>
      <form action={formAction} className="flex items-center gap-2">
        <input
          type="number"
          name="quantity"
          min={1}
          step={1}
          defaultValue={quantity}
          className="w-20 rounded-lg border border-line bg-surface-2 px-2 py-1 text-sm text-fg outline-none focus-visible:border-accent"
        />
        <SubmitButton
          pendingLabel="…"
          className="rounded-lg border border-line px-2.5 py-1 text-xs text-muted transition-colors hover:border-accent/40 hover:text-fg"
        >
          Enregistrer
        </SubmitButton>
      </form>
      {state.status === "error" && state.message && (
        <p className="mt-1 text-xs text-red-300">{state.message}</p>
      )}
    </div>
  );
}
