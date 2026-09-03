"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

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
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  function openAt(index: number, trigger: HTMLElement) {
    triggerRef.current = trigger;
    setOpenIndex(index);
  }

  function close() {
    setOpenIndex(null);
    triggerRef.current?.focus();
  }

  return (
    <div>
      <div className="relative aspect-video overflow-hidden rounded-xl border border-line bg-surface-2">
        {main ? (
          <button
            type="button"
            onClick={(e) => openAt(0, e.currentTarget)}
            className="group absolute inset-0 block w-full cursor-zoom-in border-0 bg-transparent p-0"
            aria-label={`Agrandir la photo : ${main.alt_text || constructionName}`}
          >
            <Image
              src={main.url}
              alt={main.alt_text || constructionName}
              fill
              priority
              sizes="(min-width: 1024px) 768px, 100vw"
              className="object-cover transition-opacity group-hover:opacity-90"
            />
          </button>
        ) : (
          <BuildingPlaceholder className="h-full w-full" />
        )}
      </div>

      {rest.length > 0 && (
        <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-4">
          {rest.map((image, i) => (
            <button
              key={image.id}
              type="button"
              onClick={(e) => openAt(i + 1, e.currentTarget)}
              className="group relative aspect-square cursor-zoom-in overflow-hidden rounded-lg border border-line bg-surface-2 p-0"
              aria-label={`Agrandir la photo : ${image.alt_text || constructionName}`}
            >
              <Image
                src={image.url}
                alt={image.alt_text || constructionName}
                fill
                sizes="180px"
                className="object-cover transition-opacity group-hover:opacity-90"
              />
            </button>
          ))}
        </div>
      )}

      {openIndex !== null && sorted[openIndex] && (
        <Lightbox
          images={sorted}
          index={openIndex}
          constructionName={constructionName}
          onClose={close}
          onNavigate={setOpenIndex}
        />
      )}
    </div>
  );
}

function Lightbox({
  images,
  index,
  constructionName,
  onClose,
  onNavigate,
}: {
  images: GalleryImage[];
  index: number;
  constructionName: string;
  onClose: () => void;
  onNavigate: (index: number) => void;
}) {
  const image = images[index];
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const goPrev = useCallback(
    () => onNavigate((index - 1 + images.length) % images.length),
    [index, images.length, onNavigate],
  );
  const goNext = useCallback(
    () => onNavigate((index + 1) % images.length),
    [index, images.length, onNavigate],
  );

  // Focus le bouton fermer à l'ouverture, verrouille le scroll de la page
  // en arrière-plan, et branche Échap/flèches — nettoyé à la fermeture.
  useEffect(() => {
    closeButtonRef.current?.focus();

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft" && images.length > 1) goPrev();
      if (event.key === "ArrowRight" && images.length > 1) goNext();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose, goPrev, goNext, images.length]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${image.alt_text || constructionName} — image ${index + 1} sur ${images.length}`}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-base/95 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <button
        ref={closeButtonRef}
        type="button"
        onClick={onClose}
        aria-label="Fermer"
        className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-lg border border-line bg-surface text-fg transition-colors hover:bg-surface-2"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </button>

      {images.length > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              goPrev();
            }}
            aria-label="Image précédente"
            className="absolute left-2 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-lg border border-line bg-surface/90 text-fg transition-colors hover:bg-surface-2 sm:left-4"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              goNext();
            }}
            aria-label="Image suivante"
            className="absolute right-2 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-lg border border-line bg-surface/90 text-fg transition-colors hover:bg-surface-2 sm:right-4"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        </>
      )}

      <div
        className="relative flex max-h-[85vh] max-w-[90vw] items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          key={image.id}
          src={image.url}
          alt={image.alt_text || constructionName}
          width={1920}
          height={1080}
          sizes="90vw"
          className="h-auto max-h-[85vh] w-auto max-w-[90vw] object-contain"
        />
      </div>

      {images.length > 1 && (
        <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-sm text-muted">
          {index + 1} / {images.length}
        </p>
      )}
    </div>
  );
}
