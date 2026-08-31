import { RemoveTagButton } from "@/components/admin/RemoveTagButton";
import type { ConstructionTag } from "@/lib/types";

export function TagBadgeList({
  constructionId,
  tags,
}: {
  constructionId: string;
  tags: ConstructionTag[];
}) {
  if (tags.length === 0) {
    return <p className="text-sm text-muted">Aucun tag pour l&apos;instant.</p>;
  }

  const sorted = [...tags].sort((a, b) => a.tag.name.localeCompare(b.tag.name, "fr"));

  return (
    <div className="flex flex-wrap gap-2">
      {sorted.map(({ tag }) => (
        <span
          key={tag.id}
          className="inline-flex items-center rounded-full border border-line bg-surface px-3 py-1 text-sm text-fg"
        >
          {tag.name}
          <RemoveTagButton constructionId={constructionId} tagId={tag.id} tagName={tag.name} />
        </span>
      ))}
    </div>
  );
}
