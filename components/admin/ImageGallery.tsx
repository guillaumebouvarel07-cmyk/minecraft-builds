import Image from "next/image";

import { moveConstructionImage, updateImageAltText } from "@/actions/images";
import { DeleteImageButton } from "@/components/admin/DeleteImageButton";
import { SubmitButton } from "@/components/admin/SubmitButton";
import type { ConstructionImage } from "@/lib/types";

const iconButtonClass =
  "rounded-lg border border-line px-2.5 py-1 text-xs text-muted transition-colors hover:border-accent/40 hover:text-fg disabled:pointer-events-none disabled:opacity-30";

export function ImageGallery({
  constructionId,
  images,
}: {
  constructionId: string;
  images: ConstructionImage[];
}) {
  if (images.length === 0) {
    return <p className="text-sm text-muted">Aucune image pour l&apos;instant.</p>;
  }

  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {images.map((image, index) => (
        <li key={image.id} className="rounded-xl border border-line bg-surface p-3">
          <div className="relative aspect-video overflow-hidden rounded-lg bg-surface-2">
            <Image
              src={image.url}
              alt={image.alt_text ?? ""}
              fill
              sizes="(min-width: 1024px) 320px, (min-width: 640px) 45vw, 90vw"
              className="object-cover"
            />
            {index === 0 && (
              <span className="absolute left-2 top-2 rounded-full bg-accent-dim px-2 py-0.5 text-xs font-medium text-accent">
                Image principale
              </span>
            )}
          </div>

          <form
            action={updateImageAltText.bind(null, image.id, constructionId)}
            className="mt-3 flex gap-2"
          >
            <input
              type="text"
              name="alt_text"
              defaultValue={image.alt_text ?? ""}
              placeholder="Texte alternatif"
              className="min-w-0 flex-1 rounded-lg border border-line bg-surface-2 px-2.5 py-1.5 text-xs text-fg outline-none focus-visible:border-accent"
            />
            <SubmitButton pendingLabel="…" className={iconButtonClass}>
              Enregistrer
            </SubmitButton>
          </form>

          <div className="mt-2 flex items-center justify-between gap-2">
            <div className="flex gap-1.5">
              <form action={moveConstructionImage.bind(null, image.id, constructionId, "up")}>
                <button type="submit" disabled={index === 0} className={iconButtonClass}>
                  ↑
                </button>
              </form>
              <form action={moveConstructionImage.bind(null, image.id, constructionId, "down")}>
                <button
                  type="submit"
                  disabled={index === images.length - 1}
                  className={iconButtonClass}
                >
                  ↓
                </button>
              </form>
            </div>
            <DeleteImageButton id={image.id} constructionId={constructionId} />
          </div>
        </li>
      ))}
    </ul>
  );
}
