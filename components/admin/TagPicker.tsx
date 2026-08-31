"use client";

import { useActionState, useMemo, useState } from "react";

import { attachTag, createTagAndAttach } from "@/actions/tags";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { slugify } from "@/lib/slug";
import { initialTagFormState } from "@/lib/validation/tag";
import type { Tag } from "@/lib/types";

const inputClass =
  "w-full rounded-lg border border-line bg-surface-2 px-3 py-1.5 text-sm text-fg outline-none focus-visible:border-accent";

export function TagPicker({
  constructionId,
  availableTags,
}: {
  constructionId: string;
  availableTags: Tag[];
}) {
  const [mode, setMode] = useState<"existing" | "new">("existing");
  const [query, setQuery] = useState("");

  const attachAction = attachTag.bind(null, constructionId);
  const [attachState, attachFormAction] = useActionState(attachAction, initialTagFormState);

  const createAction = createTagAndAttach.bind(null, constructionId);
  const [createState, createFormAction] = useActionState(createAction, initialTagFormState);

  const [newName, setNewName] = useState("");
  const [newSlugValue, setNewSlugValue] = useState("");
  const [newSlugTouched, setNewSlugTouched] = useState(false);
  const newSlug = newSlugTouched ? newSlugValue : slugify(newName);

  // Après une création réussie, on vide le formulaire — ajusté pendant le
  // rendu (pattern recommandé par React) plutôt que dans un effet.
  const [lastCreateStatus, setLastCreateStatus] = useState(createState.status);
  if (createState.status !== lastCreateStatus) {
    setLastCreateStatus(createState.status);
    if (createState.status === "success") {
      setNewName("");
      setNewSlugValue("");
      setNewSlugTouched(false);
    }
  }

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return availableTags.filter((t) => t.name.toLowerCase().includes(q)).slice(0, 8);
  }, [query, availableTags]);

  const activeState = mode === "existing" ? attachState : createState;

  return (
    <div className="rounded-xl border border-line bg-surface p-4">
      <div className="flex gap-2 text-sm">
        <button
          type="button"
          onClick={() => setMode("existing")}
          className={`rounded-lg px-3 py-1.5 ${
            mode === "existing" ? "bg-accent-dim text-accent" : "text-muted hover:text-fg"
          }`}
        >
          Tag existant
        </button>
        <button
          type="button"
          onClick={() => setMode("new")}
          className={`rounded-lg px-3 py-1.5 ${
            mode === "new" ? "bg-accent-dim text-accent" : "text-muted hover:text-fg"
          }`}
        >
          Nouveau tag
        </button>
      </div>

      {mode === "existing" && (
        <div className="mt-3 space-y-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Rechercher un tag…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className={inputClass}
              autoComplete="off"
            />
            {matches.length > 0 && (
              <ul className="absolute z-10 mt-1 w-full overflow-hidden rounded-lg border border-line bg-surface-2 shadow-lg">
                {matches.map((t) => (
                  <li key={t.id}>
                    <form action={attachFormAction} onSubmit={() => setQuery("")}>
                      <input type="hidden" name="tag_id" value={t.id} />
                      <button
                        type="submit"
                        className="w-full px-3 py-2 text-left text-sm hover:bg-surface"
                      >
                        {t.name}
                      </button>
                    </form>
                  </li>
                ))}
              </ul>
            )}
            {query.trim() && matches.length === 0 && (
              <p className="mt-1.5 text-xs text-muted">
                Aucun résultat — utilise l&apos;onglet &laquo;&nbsp;Nouveau tag&nbsp;&raquo;.
              </p>
            )}
          </div>
        </div>
      )}

      {mode === "new" && (
        <form action={createFormAction} className="mt-3 flex flex-wrap items-end gap-3">
          <div className="min-w-[160px] flex-1">
            <label htmlFor="new-tag-name" className="block text-xs font-medium text-muted">
              Nom
            </label>
            <input
              id="new-tag-name"
              name="name"
              required
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className={`${inputClass} mt-1`}
            />
          </div>
          <div className="min-w-[160px] flex-1">
            <label htmlFor="new-tag-slug" className="block text-xs font-medium text-muted">
              Slug
            </label>
            <input
              id="new-tag-slug"
              name="slug"
              required
              value={newSlug}
              onChange={(e) => {
                setNewSlugTouched(true);
                setNewSlugValue(e.target.value);
              }}
              className={`${inputClass} mt-1 font-mono`}
            />
          </div>
          <SubmitButton
            pendingLabel="Création…"
            className="rounded-lg bg-accent px-4 py-1.5 text-sm font-medium text-base transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            Créer et ajouter
          </SubmitButton>
        </form>
      )}

      {activeState.status !== "idle" && activeState.message && (
        <p
          role="alert"
          className={`mt-3 rounded-lg border px-3 py-2 text-sm ${
            activeState.status === "success"
              ? "border-accent/40 bg-accent-dim text-accent"
              : "border-red-900/50 bg-red-950/40 text-red-300"
          }`}
        >
          {activeState.message}
        </p>
      )}
    </div>
  );
}
