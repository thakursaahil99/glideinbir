"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { clsx } from "clsx";
import { Expand, X, ChevronLeft, ChevronRight } from "lucide-react";

// Main image + thumbnail strip, with a full-screen lightbox to actually
// explore every photo an admin uploaded (not just flip the small inline
// preview) — click the image, a thumbnail, or "View all N photos".
export function PhotoGallery({ images, alt }: { images: string[]; alt: string }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const active = images[activeIndex] ?? images[0] ?? "/placeholder.svg";

  function openAt(index: number) {
    setActiveIndex(index);
    setLightboxOpen(true);
  }

  useEffect(() => {
    if (!lightboxOpen) return;
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setLightboxOpen(false);
      if (e.key === "ArrowRight") setActiveIndex((i) => (i + 1) % images.length);
      if (e.key === "ArrowLeft") setActiveIndex((i) => (i - 1 + images.length) % images.length);
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [lightboxOpen, images.length]);

  return (
    <div>
      <button
        type="button"
        onClick={() => openAt(activeIndex)}
        className="group relative block aspect-[4/3] w-full overflow-hidden rounded-3xl"
        aria-label="View full gallery"
      >
        <Image src={active} alt={alt} fill priority className="object-cover" />
        <span className="absolute inset-0 bg-ink/0 transition-colors group-hover:bg-ink/10" />
        <span className="glass absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-white">
          <Expand className="h-3.5 w-3.5" />
          {images.length > 1 ? `View all ${images.length} photos` : "View photo"}
        </span>
      </button>

      {images.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {images.map((src, i) => (
            <button
              key={src + i}
              type="button"
              onClick={() => setActiveIndex(i)}
              aria-label={`Show photo ${i + 1} of ${images.length}`}
              className={clsx(
                "relative h-16 w-20 shrink-0 overflow-hidden rounded-xl ring-2 transition-all",
                i === activeIndex ? "ring-brand" : "ring-transparent opacity-70 hover:opacity-100",
              )}
            >
              <Image src={src} alt="" fill className="object-cover" />
            </button>
          ))}
        </div>
      )}

      {lightboxOpen && (
        <div
          className="fixed inset-0 z-[100] flex flex-col bg-ink/95 backdrop-blur-sm"
          onClick={() => setLightboxOpen(false)}
        >
          <div className="flex items-center justify-between px-4 py-3 text-white/80">
            <span className="text-sm">
              {activeIndex + 1} / {images.length}
            </span>
            <button
              type="button"
              onClick={() => setLightboxOpen(false)}
              aria-label="Close gallery"
              className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-white/10"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="relative flex-1 px-4 pb-4" onClick={(e) => e.stopPropagation()}>
            <div className="relative h-full w-full">
              <Image src={active} alt={alt} fill className="object-contain" />
            </div>

            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => setActiveIndex((i) => (i - 1 + images.length) % images.length)}
                  aria-label="Previous photo"
                  className="absolute left-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 sm:left-4"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() => setActiveIndex((i) => (i + 1) % images.length)}
                  aria-label="Next photo"
                  className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 sm:right-4"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
