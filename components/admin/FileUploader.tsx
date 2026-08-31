"use client";

import { useActionState, useState } from "react";

import { uploadConstructionFiles } from "@/actions/files";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { initialFileActionState } from "@/lib/validation/construction-file";

export function FileUploader({ constructionId }: { constructionId: string }) {
  const uploadAction = uploadConstructionFiles.bind(null, constructionId);
  const [state, formAction] = useActionState(uploadAction, initialFileActionState);
  const [selectedNames, setSelectedNames] = useState<string[]>([]);

  return (
    <form action={formAction} className="space-y-3 rounded-xl border border-line bg-surface p-4">
      <div>
        <label htmlFor="construction-files" className="block text-sm font-medium text-fg">
          Ajouter des fichiers
        </label>
        <input
          id="construction-files"
          name="files"
          type="file"
          multiple
          accept=".litematic,.schem,.schematic"
          onChange={(event) => {
            setSelectedNames(Array.from(event.target.files ?? []).map((f) => f.name));
          }}
          className="mt-1.5 block w-full text-sm text-muted file:mr-3 file:rounded-lg file:border file:border-line file:bg-surface-2 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-fg file:transition-colors hover:file:border-accent/40"
        />
        <p className="mt-1.5 text-xs text-muted">.litematic, .schem, .schematic — 20 Mo maximum.</p>
      </div>

      {selectedNames.length > 0 && (
        <ul className="text-xs text-muted">
          {selectedNames.map((name) => (
            <li key={name}>{name}</li>
          ))}
        </ul>
      )}

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

      <SubmitButton
        pendingLabel="Envoi…"
        className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-base transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        Envoyer
      </SubmitButton>
    </form>
  );
}
