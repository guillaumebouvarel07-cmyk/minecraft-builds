"use client";

import { removeTagFromConstruction } from "@/actions/tags";

export function RemoveTagButton({
  constructionId,
  tagId,
  tagName,
}: {
  constructionId: string;
  tagId: string;
  tagName: string;
}) {
  return (
    <form action={removeTagFromConstruction.bind(null, constructionId, tagId)}>
      <button
        type="submit"
        aria-label={`Retirer le tag ${tagName}`}
        className="ml-1 text-muted hover:text-red-300"
      >
        ×
      </button>
    </form>
  );
}
