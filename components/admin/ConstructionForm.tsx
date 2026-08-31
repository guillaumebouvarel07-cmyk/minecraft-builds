"use client";

import { useActionState, useEffect, useState } from "react";

import { SubmitButton } from "@/components/admin/SubmitButton";
import { slugify } from "@/lib/slug";
import {
  initialConstructionFormState,
  type ConstructionFormState,
} from "@/lib/validation/construction";
import type { Construction } from "@/lib/types";

type CategoryOption = { id: string; name: string };

type Action = (
  state: ConstructionFormState,
  formData: FormData,
) => Promise<ConstructionFormState>;

const inputClass =
  "mt-1.5 w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-fg outline-none focus-visible:border-accent";
const labelClass = "block text-sm font-medium text-fg";
const fieldErrorClass = "mt-1 text-xs text-red-300";

function Field({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string[];
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className={labelClass}>
        {label}
      </label>
      {children}
      {error && <p className={fieldErrorClass}>{error[0]}</p>}
    </div>
  );
}

export function ConstructionForm({
  mode,
  action,
  categories,
  construction,
}: {
  mode: "create" | "edit";
  action: Action;
  categories: CategoryOption[];
  construction?: Construction;
}) {
  const [state, formAction] = useActionState(action, initialConstructionFormState);

  const [name, setName] = useState(construction?.name ?? "");
  const [slugValue, setSlugValue] = useState(construction?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(mode === "edit");
  const [isDirty, setIsDirty] = useState(false);

  // Le slug affiché suit le nom tant qu'il n'a pas été modifié à la main —
  // dérivé directement au rendu plutôt que synchronisé via un effet.
  const slug = slugTouched ? slugValue : slugify(name);

  // Après un enregistrement réussi, on retombe sur un état "propre". Ajusté
  // pendant le rendu (pattern recommandé par React) plutôt que dans un
  // effet, pour éviter un rendu en cascade après commit.
  const [lastHandledStatus, setLastHandledStatus] = useState(state.status);
  if (state.status !== lastHandledStatus) {
    setLastHandledStatus(state.status);
    if (state.status === "success") {
      setIsDirty(false);
    }
  }

  useEffect(() => {
    function handleBeforeUnload(event: BeforeUnloadEvent) {
      if (isDirty) {
        event.preventDefault();
      }
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  const errors = state.fieldErrors ?? {};

  return (
    <form
      action={formAction}
      onChange={() => setIsDirty(true)}
      className="space-y-8"
    >
      {state.status !== "idle" && state.message && (
        <p
          role="alert"
          className={`rounded-lg border px-3 py-2 text-sm ${
            state.status === "success"
              ? "border-accent/40 bg-accent-dim text-accent"
              : "border-red-900/50 bg-red-950/40 text-red-300"
          }`}
        >
          {state.message}
        </p>
      )}

      {isDirty && (
        <p className="rounded-lg border border-line bg-surface px-3 py-2 text-xs text-muted">
          Modifications non enregistrées.
        </p>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="Nom" htmlFor="name" error={errors.name}>
          <input
            id="name"
            name="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClass}
          />
        </Field>

        <Field label="Slug" htmlFor="slug" error={errors.slug}>
          <input
            id="slug"
            name="slug"
            required
            value={slug}
            onChange={(e) => {
              setSlugTouched(true);
              setSlugValue(e.target.value);
            }}
            className={`${inputClass} font-mono`}
          />
        </Field>
      </div>

      <Field label="Description" htmlFor="description" error={errors.description}>
        <textarea
          id="description"
          name="description"
          required
          rows={4}
          defaultValue={construction?.description}
          className={inputClass}
        />
      </Field>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="Catégorie" htmlFor="category_id" error={errors.category_id}>
          <select
            id="category_id"
            name="category_id"
            defaultValue={construction?.category_id ?? ""}
            className={inputClass}
          >
            <option value="">Aucune catégorie</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Style" htmlFor="style" error={errors.style}>
          <input
            id="style"
            name="style"
            defaultValue={construction?.style ?? ""}
            placeholder="ex : médiéval, moderne…"
            className={inputClass}
          />
        </Field>
      </div>

      <div className="grid gap-6 sm:grid-cols-3">
        <Field label="Difficulté" htmlFor="difficulty" error={errors.difficulty}>
          <select
            id="difficulty"
            name="difficulty"
            defaultValue={construction?.difficulty ?? "moyen"}
            className={inputClass}
          >
            <option value="facile">Facile</option>
            <option value="moyen">Moyen</option>
            <option value="difficile">Difficile</option>
            <option value="expert">Expert</option>
          </select>
        </Field>

        <Field label="Édition" htmlFor="edition" error={errors.edition}>
          <select
            id="edition"
            name="edition"
            defaultValue={construction?.edition ?? "java"}
            className={inputClass}
          >
            <option value="java">Java</option>
            <option value="bedrock">Bedrock</option>
            <option value="both">Java + Bedrock</option>
          </select>
        </Field>

        <Field label="Statut" htmlFor="status" error={errors.status}>
          <select
            id="status"
            name="status"
            defaultValue={construction?.status ?? "brouillon"}
            className={inputClass}
          >
            <option value="brouillon">Brouillon</option>
            <option value="publie">Publié</option>
          </select>
        </Field>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="Version minimale" htmlFor="min_version" error={errors.min_version}>
          <input
            id="min_version"
            name="min_version"
            required
            defaultValue={construction?.min_version ?? ""}
            placeholder="ex : 1.21"
            className={inputClass}
          />
        </Field>

        <Field label="Version maximale (optionnel)" htmlFor="max_version" error={errors.max_version}>
          <input
            id="max_version"
            name="max_version"
            defaultValue={construction?.max_version ?? ""}
            className={inputClass}
          />
        </Field>
      </div>

      <div className="grid gap-6 sm:grid-cols-3">
        <Field label="Largeur (blocs)" htmlFor="width" error={errors.width}>
          <input
            id="width"
            name="width"
            type="number"
            min={1}
            defaultValue={construction?.width ?? ""}
            className={inputClass}
          />
        </Field>

        <Field label="Longueur (blocs)" htmlFor="length" error={errors.length}>
          <input
            id="length"
            name="length"
            type="number"
            min={1}
            defaultValue={construction?.length ?? ""}
            className={inputClass}
          />
        </Field>

        <Field label="Hauteur (blocs)" htmlFor="height" error={errors.height}>
          <input
            id="height"
            name="height"
            type="number"
            min={1}
            defaultValue={construction?.height ?? ""}
            className={inputClass}
          />
        </Field>
      </div>

      <div className="flex items-center gap-3 border-t border-line pt-6">
        <SubmitButton
          pendingLabel="Enregistrement…"
          className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-base transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {mode === "create" ? "Créer la construction" : "Enregistrer"}
        </SubmitButton>
      </div>
    </form>
  );
}
