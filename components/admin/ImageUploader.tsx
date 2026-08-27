"use client";

import { useActionState, useState } from "react";

import { uploadConstructionImages } from "@/actions/images";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { initialImageActionState } from "@/lib/validation/image";

export function ImageUploader({ constructionId }: { constructionId: string }) {
  const uploadAction = uploadConstructionImages.bind(null, constructionId);
  const [state, formAction] = useActionState(uploadAction, initialImageActionState);
  const [previews, setPreviews] = useState<{ url: string; name: string }[]>([]);

  return (
    <form action={formAction} className="space-y-3 rounded-xl border border-line bg-surface p-4">
      <div>
        <label htmlFor="files" className="block text-sm font-medium text-fg">
          Ajouter des images
        </label>
        <input
          id="files"
          name="files"
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          onChange={(event) => {
            const files = Array.from(event.target.files ?? []);
            previews.forEach((p) => URL.revokeObjectURL(p.url));
            setPreviews(files.map((file) => ({ url: URL.createObjectURL(file), name: file.name })));
          }}
          className="mt-1.5 block w-full text-sm text-muted file:mr-3 file:rounded-lg file:border file:border-line file:bg-surface-2 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-fg file:transition-colors hover:file:border-accent/40"
        />
        <p className="mt-1.5 text-xs text-muted">JPEG, PNG ou WebP — 5 Mo maximum par image.</p>
      </div>

      {previews.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {previews.map((preview) => (
            // eslint-disable-next-line @next/next/no-img-element -- aperçu local (blob:), pas éligible à next/image
            <img
              key={preview.url}
              src={preview.url}
              alt={preview.name}
              className="h-16 w-16 rounded-lg border border-line object-cover"
            />
          ))}
        </div>
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
