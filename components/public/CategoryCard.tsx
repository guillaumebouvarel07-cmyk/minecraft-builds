import Link from "next/link";

import { Card } from "@/components/ui/Card";

export function CategoryCard({
  slug,
  name,
  count,
}: {
  slug: string;
  name: string;
  count: number;
}) {
  return (
    <Card hover className="p-5">
      <Link href={`/categorie/${slug}`} className="block">
        <p className="text-base font-semibold tracking-tight text-fg">{name}</p>
        <p className="mt-1 text-sm text-muted">
          {count} construction{count > 1 ? "s" : ""}
        </p>
      </Link>
    </Card>
  );
}
