"use client";

import { useActionState } from "react";

import { deleteTag, updateTag } from "@/actions/tags";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { initialTagFormState } from "@/lib/validation/tag";
import type { Tag } from "@/lib/types";

const inputClass =
  "w-full rounded-lg border border-line bg-surface-2 px-3 py-1.5 text-sm text-fg outline-none focus-visible:border-accent";

export function TagRow({ tag, usageCount }: { tag: Tag; usageCount: number }) {
  const updateAction = updateTag.bind(null, tag.id);
  const [updateState, updateFormAction] = useActionState(updateAction, initialTagFormState);

  async function deleteActionWrapper() {
    return deleteTag(tag.id);
  }
  const [deleteState, deleteFormAction] = useActionState(deleteActionWrapper, initialTagFormState);

  const errors = updateState.fieldErrors ?? {};

  return (
    <li className="p-4">
      <div className="flex flex-wrap items-end gap-3">
        <form action={updateFormAction} className="flex flex-1 flex-wrap items-end gap-3">
          <div className="min-w-[140px] flex-1">
            <label className="block text-xs font-medium text-muted">Nom</label>
            <input name="name" defaultValue={tag.name} required className={`${inputClass} mt-1`} />
            {errors.name && <p className="mt-1 text-xs text-red-300">{errors.name[0]}</p>}
          </div>
          <div className="min-w-[140px] flex-1">
            <label className="block text-xs font-medium text-muted">Slug</label>
            <input
              name="slug"
              defaultValue={tag.slug}
              required
              className={`${inputClass} mt-1 font-mono`}
            />
            {errors.slug && <p className="mt-1 text-xs text-red-300">{errors.slug[0]}</p>}
          </div>
          <SubmitButton
            pendingLabel="…"
            className="rounded-lg border border-line px-3 py-1.5 text-sm text-fg transition-colors hover:border-accent/40"
          >
            Enregistrer
          </SubmitButton>
        </form>

        <form
          action={deleteFormAction}
          onSubmit={(event) => {
            if (!confirm(`Supprimer le tag « ${tag.name} » ?`)) {
              event.preventDefault();
            }
          }}
        >
          <SubmitButton
            pendingLabel="…"
            className="rounded-lg border border-line px-3 py-1.5 text-sm text-red-300 transition-colors hover:border-red-900/60 hover:bg-red-950/30"
          >
            Supprimer
          </SubmitButton>
        </form>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-3">
        <span className="text-xs text-muted">
          {usageCount === 0
            ? "Utilisé par aucune construction"
            : `Utilisé par ${usageCount} construction${usageCount > 1 ? "s" : ""}`}
        </span>
        {updateState.status !== "idle" && updateState.message && !errors.name && !errors.slug && (
          <span className={`text-xs ${updateState.status === "success" ? "text-accent" : "text-red-300"}`}>
            {updateState.message}
          </span>
        )}
        {deleteState.status === "error" && (
          <span className="text-xs text-red-300">{deleteState.message}</span>
        )}
      </div>
    </li>
  );
}
