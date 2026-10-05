"use client";

import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import type { MediaVideo } from "@/content/media-videos";
import { PreviewVideo } from "./preview-video";
import { MediaViewer } from "./media-viewer";

// Instagram-style row of 9:16 reels. Clips play (muted) as they scroll into
// view; tap one for the full-screen viewer with sound and swipe-to-next.
export function ReelsStrip({ items }: { items: MediaVideo[] }) {
  const [open, setOpen] = useState<number | null>(null);
  const scroller = useRef<HTMLDivElement>(null);

  if (items.length === 0) return null;

  function scrollBy(dir: 1 | -1) {
    const el = scroller.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
  }

  return (
    <div className="relative">
      <div
        ref={scroller}
        className="no-scrollbar -mx-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-3"
      >
        {items.map((v, i) => (
          <button
            key={v.id}
            type="button"
            onClick={() => setOpen(i)}
            aria-label={`Play reel: ${v.label}`}
            className="group relative aspect-[9/16] w-[44vw] max-w-[230px] shrink-0 snap-start overflow-hidden rounded-2xl bg-ink text-left shadow-lg ring-1 ring-black/5 transition-transform duration-300 hover:-translate-y-1 sm:w-[210px]"
          >
            <PreviewVideo
              video={v}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <span className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/25" />
            <span className="absolute left-3 top-3 rounded-full bg-gradient-to-r from-fuchsia-500 to-orange-400 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow">
              Reel
            </span>
            <span className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/25 text-white opacity-0 backdrop-blur transition-opacity group-hover:opacity-100">
              <Play className="h-3.5 w-3.5 fill-current" />
            </span>
            <span className="absolute inset-x-3 bottom-3 text-sm font-semibold leading-tight text-white drop-shadow">
              {v.label}
            </span>
          </button>
        ))}
      </div>

      {items.length > 3 && (
        <>
          <button
            type="button"
            onClick={() => scrollBy(-1)}
            aria-label="Scroll reels left"
            className="absolute -left-3 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-paper text-ink shadow-lg ring-1 ring-black/5 hover:bg-brand hover:text-white lg:flex"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => scrollBy(1)}
            aria-label="Scroll reels right"
            className="absolute -right-3 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-paper text-ink shadow-lg ring-1 ring-black/5 hover:bg-brand hover:text-white lg:flex"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}

      {open !== null && <MediaViewer items={items} startIndex={open} onClose={() => setOpen(null)} />}
    </div>
  );
}
