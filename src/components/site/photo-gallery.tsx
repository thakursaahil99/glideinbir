"use client";

import { useState } from "react";
import Image from "next/image";
import { clsx } from "clsx";

// Main image + a thumbnail strip underneath — every photo an admin uploads
// for this package/course/hotel/item/route is browsable here, not just the
// first one. Falls back to a single static image when there's only one
// (or none, via the caller's placeholder).
export function PhotoGallery({ images, alt }: { images: string[]; alt: string }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = images[activeIndex] ?? images[0] ?? "/placeholder.svg";

  return (
    <div>
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl">
        <Image src={active} alt={alt} fill priority className="object-cover" />
      </div>
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
    </div>
  );
}
