import Image from "next/image";

import { BuildingPlaceholder } from "@/components/public/BuildingPlaceholder";

export type GalleryImage = {
  id: string;
  url: string;
  alt_text: string | null;
  position: number;
};

export function ConstructionGallery({
  images,
  constructionName,
}: {
  images: GalleryImage[];
  constructionName: string;
}) {
  const sorted = [...images].sort((a, b) => a.position - b.position);
  const [main, ...rest] = sorted;

  return (
    <div>
      <div className="relative aspect-video overflow-hidden rounded-xl border border-line bg-surface-2">
        {main ? (
          <Image
            src={main.url}
            alt={main.alt_text || constructionName}
            fill
            priority
            sizes="(min-width: 1024px) 768px, 100vw"
            className="object-cover"
          />
        ) : (
          <BuildingPlaceholder className="h-full w-full" />
        )}
      </div>

      {rest.length > 0 && (
        <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-4">
          {rest.map((image) => (
            <div
              key={image.id}
              className="relative aspect-square overflow-hidden rounded-lg border border-line bg-surface-2"
            >
              <Image
                src={image.url}
                alt={image.alt_text || constructionName}
                fill
                sizes="180px"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
