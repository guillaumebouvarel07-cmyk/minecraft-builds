"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";

import { deleteMaterialFromCatalog } from "@/actions/materials";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { initialMaterialActionState, type MaterialActionState } from "@/lib/validation/material";

export function DeleteMaterialButton({
  materialId,
  materialName,
}: {
  materialId: string;
  materialName: string;
}) {
  const router = useRouter();

  async function action(): Promise<MaterialActionState> {
    const result = await deleteMaterialFromCatalog(materialId);
    if (result.status === "success") {
      router.refresh();
    }
    return result;
  }

  const [state, formAction] = useActionState(action, initialMaterialActionState);

  return (
    <div className="inline-block" onClick={(e) => e.stopPropagation()}>
      <form
        action={formAction}
        onSubmit={(event) => {
          if (
            !confirm(
              `Supprimer « ${materialName} » du catalogue global ? Impossible si utilisé par une construction. Action irréversible.`,
            )
          ) {
            event.preventDefault();
          }
        }}
      >
        <SubmitButton
          pendingLabel="…"
          className="rounded-md border border-line px-1.5 py-0.5 text-xs text-red-300 transition-colors hover:border-red-900/60 hover:bg-red-950/30"
        >
          Suppr.
        </SubmitButton>
      </form>
      {state.status === "error" && state.message && (
        <p className="mt-1 max-w-[200px] text-xs text-red-300">{state.message}</p>
      )}
    </div>
  );
}
