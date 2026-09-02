import Image from "next/image";
import Link from "next/link";

import { BuildingPlaceholder } from "@/components/public/BuildingPlaceholder";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import type { ContentStatus } from "@/lib/content-status";
import { difficultyLabels, editionLabels } from "@/lib/constructions-labels";
import type { DifficultyLevel, EditionType } from "@/lib/types";

export type ConstructionCardData = {
  slug: string;
  name: string;
  difficulty: DifficultyLevel;
  edition: EditionType;
  width: number | null;
  length: number | null;
  height: number | null;
  contentStatus: ContentStatus;
  category: { name: string; slug: string } | null;
  tags: string[];
  imageUrl?: string | null;
  imageAlt?: string | null;
};

export function ConstructionCard({ construction }: { construction: ConstructionCardData }) {
  const {
    slug,
    name,
    difficulty,
    edition,
    width,
    length,
    height,
    contentStatus,
    category,
    tags,
    imageUrl,
    imageAlt,
  } = construction;

  const dimensions = width && length && height ? `${width} × ${length} × ${height}` : null;

  return (
    <Card hover className="group overflow-hidden">
      <Link href={`/construction/${slug}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden bg-surface-2">
          {contentStatus === "demo" && (
            <span className="absolute left-2 top-2 z-10 rounded-full border border-line bg-surface/90 px-2 py-0.5 text-[11px] font-medium text-muted backdrop-blur-sm">
              Démo
            </span>
          )}
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={imageAlt ?? name}
              fill
              sizes="(min-width: 1024px) 320px, (min-width: 640px) 45vw, 90vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <BuildingPlaceholder className="h-full w-full" />
          )}
        </div>

        <div className="p-4">
          {category && <p className="text-xs font-medium text-muted">{category.name}</p>}
          <h3 className="mt-1 truncate text-base font-semibold tracking-tight text-fg">{name}</h3>

          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            <Badge>{difficultyLabels[difficulty]}</Badge>
            <Badge>{editionLabels[edition]}</Badge>
            {dimensions && <Badge>{dimensions}</Badge>}
          </div>

          {tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="accent">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </Link>
    </Card>
  );
}
