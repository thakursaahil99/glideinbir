"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp, ExternalLink, Volume2, VolumeX, X } from "lucide-react";
import { clsx } from "clsx";
import type { MediaVideo } from "@/content/media-videos";

// Full-screen player for reels and videos. Opens on a tap (so sound can
// play), swipe / arrow keys go to the next clip, Esc closes. Reels are shown
// 9:16 like a phone reel; landscape videos get a wide frame with controls.
export function MediaViewer({
  items,
  startIndex,
  onClose,
}: {
  items: MediaVideo[];
  startIndex: number;
  onClose: () => void;
}) {
  const [index, setIndex] = useState(startIndex);
  const [muted, setMuted] = useState(false);
  const touchY = useRef<number | null>(null);
  const item = items[index];

  const go = useCallback(
    (dir: 1 | -1) => setIndex((i) => (i + dir + items.length) % items.length),
    [items.length],
  );

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight" || e.key === "ArrowDown") go(1);
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") go(-1);
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [go, onClose]);

  if (!item) return null;
  const reel = item.kind === "reel";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/92 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={item.label}
      onClick={onClose}
      onTouchStart={(e) => {
        touchY.current = e.touches[0]?.clientY ?? null;
      }}
      onTouchEnd={(e) => {
        const start = touchY.current;
        touchY.current = null;
        const end = e.changedTouches[0]?.clientY;
        if (start === null || end === undefined) return;
        if (start - end > 70) go(1);
        else if (end - start > 70) go(-1);
      }}
    >
      <div
        className={clsx(
          "relative overflow-hidden bg-black shadow-2xl",
          reel
            ? "h-[100svh] w-[min(100vw,calc(100svh*9/16))] sm:h-[92svh] sm:w-[min(92vw,calc(92svh*9/16))] sm:rounded-3xl"
            : "aspect-video w-[min(96vw,1100px)] rounded-2xl",
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <video
          key={item.id}
          className="h-full w-full object-contain"
          autoPlay
          loop
          playsInline
          muted={muted}
          controls={!reel}
          poster={item.poster}
        >
          <source src={item.hd} type="video/webm" />
          {item.mp4 && <source src={item.mp4} type="video/mp4" />}
        </video>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4 pt-16 text-white">
          <p className="text-base font-semibold">{item.label}</p>
          <p className="mt-0.5 text-[11px] text-white/60">
            {item.credit} ·{" "}
            <a
              href={item.page}
              target="_blank"
              rel="noopener noreferrer"
              className="pointer-events-auto inline-flex items-center gap-0.5 underline"
            >
              Source <ExternalLink className="h-3 w-3" />
            </a>
          </p>
          <p className="mt-1 text-[11px] text-white/50">
            {index + 1} / {items.length}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setMuted((m) => !m)}
          aria-label={muted ? "Turn sound on" : "Turn sound off"}
          className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur hover:bg-black/70"
        >
          {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
        </button>
      </div>

      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute left-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur hover:bg-white/25 sm:left-auto sm:right-5 sm:top-5"
      >
        <X className="h-5 w-5" />
      </button>

      {items.length > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              go(-1);
            }}
            aria-label="Previous"
            className="absolute left-4 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur hover:bg-white/25 sm:flex"
          >
            {reel ? <ChevronUp className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              go(1);
            }}
            aria-label="Next"
            className="absolute right-4 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur hover:bg-white/25 sm:flex"
          >
            {reel ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
          </button>
        </>
      )}
    </div>
  );
}
