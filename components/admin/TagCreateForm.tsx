"use client";

import { useActionState, useState } from "react";

import { createTag } from "@/actions/tags";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { slugify } from "@/lib/slug";
import { initialTagFormState } from "@/lib/validation/tag";

const inputClass =
  "w-full rounded-lg border border-line bg-surface px-3 py-1.5 text-sm text-fg outline-none focus-visible:border-accent";

export function TagCreateForm() {
  const [state, formAction] = useActionState(createTag, initialTagFormState);
  const [name, setName] = useState("");
  const [slugValue, setSlugValue] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);

  const [lastHandledStatus, setLastHandledStatus] = useState(state.status);
  if (state.status !== lastHandledStatus) {
    setLastHandledStatus(state.status);
    if (state.status === "success") {
      setName("");
      setSlugValue("");
      setSlugTouched(false);
    }
  }

  const slug = slugTouched ? slugValue : slugify(name);
  const errors = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="rounded-xl border border-line bg-surface p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="tag-new-name" className="block text-xs font-medium text-muted">
            Nom
          </label>
          <input
            id="tag-new-name"
            name="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={`${inputClass} mt-1`}
          />
          {errors.name && <p className="mt-1 text-xs text-red-300">{errors.name[0]}</p>}
        </div>
        <div>
          <label htmlFor="tag-new-slug" className="block text-xs font-medium text-muted">
            Slug
          </label>
          <input
            id="tag-new-slug"
            name="slug"
            required
            value={slug}
            onChange={(e) => {
              setSlugTouched(true);
              setSlugValue(e.target.value);
            }}
            className={`${inputClass} mt-1 font-mono`}
          />
          {errors.slug && <p className="mt-1 text-xs text-red-300">{errors.slug[0]}</p>}
        </div>
      </div>

      <div className="mt-3 flex items-center gap-3">
        <SubmitButton
          pendingLabel="Création…"
          className="rounded-lg bg-accent px-4 py-1.5 text-sm font-medium text-base transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          Créer le tag
        </SubmitButton>
        {state.status !== "idle" && state.message && (
          <p className={`text-sm ${state.status === "success" ? "text-accent" : "text-red-300"}`}>
            {state.message}
          </p>
        )}
      </div>
    </form>
  );
}
