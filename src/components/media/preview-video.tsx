"use client";

import { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "@/components/effects/use-reduced-motion";
import type { MediaVideo } from "@/content/media-videos";

// A muted looping preview that only plays while it is on screen (and never
// for visitors who asked for reduced motion), so a page full of clips costs
// one or two decoders, not twenty. Shows the poster, or the first frame if
// the poster can't load.
export function PreviewVideo({ video, className }: { video: MediaVideo; className?: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        if (entry.isIntersecting && entry.intersectionRatio >= 0.55) {
          el.play().catch(() => {});
        } else {
          el.pause();
        }
      },
      { threshold: [0, 0.55, 1] },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduced]);

  return (
    <video
      ref={ref}
      className={className}
      poster={video.poster}
      muted
      loop
      playsInline
      preload="metadata"
      aria-hidden
      tabIndex={-1}
    >
      <source src={`${video.preview}#t=0.1`} type="video/webm" />
      {video.mp4 && <source src={`${video.mp4}#t=0.1`} type="video/mp4" />}
    </video>
  );
}
