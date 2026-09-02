import Link from "next/link";

import { Card } from "@/components/ui/Card";

export function CategoryCard({
  slug,
  name,
  description,
  count,
}: {
  slug: string;
  name: string;
  description?: string | null;
  count: number;
}) {
  return (
    <Card hover className="p-5">
      <Link href={`/categorie/${slug}`} className="block">
        <h3 className="text-base font-semibold tracking-tight text-fg">{name}</h3>
        {description && (
          <p className="mt-1.5 line-clamp-2 text-sm text-muted">{description}</p>
        )}
        <p className="mt-3 text-xs text-muted">
          {count} construction{count > 1 ? "s" : ""}
        </p>
      </Link>
    </Card>
  );
}
