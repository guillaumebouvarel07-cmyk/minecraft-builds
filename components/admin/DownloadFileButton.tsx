"use client";

import { useState } from "react";

import { getFileDownloadUrl } from "@/actions/files";

export function DownloadFileButton({ id }: { id: string }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div>
      <button
        type="button"
        disabled={pending}
        onClick={async () => {
          setPending(true);
          setError(null);
          const result = await getFileDownloadUrl(id);
          setPending(false);
          if ("error" in result) {
            setError(result.error);
            return;
          }
          window.open(result.url, "_blank", "noopener,noreferrer");
        }}
        className="rounded-lg border border-line px-2.5 py-1 text-xs text-fg transition-colors hover:border-accent/40 disabled:opacity-50"
      >
        {pending ? "…" : "Télécharger"}
      </button>
      {error && <p className="mt-1 text-xs text-red-300">{error}</p>}
    </div>
  );
}
