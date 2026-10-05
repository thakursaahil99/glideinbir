"use client";

import { useState } from "react";
import { Play } from "lucide-react";
import { clsx } from "clsx";
import type { MediaVideo } from "@/content/media-videos";
import { PreviewVideo } from "./preview-video";
import { MediaViewer } from "./media-viewer";

function formatDuration(seconds: number): string {
  if (!seconds) return "";
  const m = Math.floor(seconds / 60);
  const s = String(seconds % 60).padStart(2, "0");
  return `${m}:${s}`;
}

function VideoTile({
  video,
  onOpen,
  className,
  big = false,
}: {
  video: MediaVideo;
  onOpen: () => void;
  className?: string;
  big?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`Play video: ${video.label}`}
      className={clsx(
        "group relative overflow-hidden rounded-2xl bg-ink text-left shadow-lg ring-1 ring-black/5",
        className,
      )}
    >
      <PreviewVideo
        video={video}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
      />
      <span className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/5 to-transparent" />
      <span
        className={clsx(
          "absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-brand shadow-xl transition-transform duration-300 group-hover:scale-110",
          big ? "h-16 w-16" : "h-11 w-11",
        )}
      >
        <Play className={clsx("fill-current", big ? "h-7 w-7" : "h-5 w-5")} />
      </span>
      <span className="absolute inset-x-4 bottom-3 flex items-end justify-between gap-2 text-white">
        <span className={clsx("font-semibold leading-tight drop-shadow", big ? "text-lg" : "text-sm")}>
          {video.label}
        </span>
        {video.duration > 0 && (
          <span className="shrink-0 rounded-full bg-black/55 px-2 py-0.5 text-[11px] font-medium backdrop-blur">
            {formatDuration(video.duration)}
          </span>
        )}
      </span>
    </button>
  );
}

// One big featured clip plus smaller ones beside it. Muted previews loop
// while on screen; a tap opens the full player with sound.
export function VideoShowcase({ items }: { items: MediaVideo[] }) {
  const [open, setOpen] = useState<number | null>(null);
  const [first, ...rest] = items;
  if (!first) return null;

  return (
    <div className="grid gap-4 md:grid-cols-[1.7fr_1fr]">
      <VideoTile video={first} onOpen={() => setOpen(0)} big className="aspect-video w-full" />
      {rest.length > 0 && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-1">
          {rest.slice(0, 2).map((v, i) => (
            <VideoTile key={v.id} video={v} onOpen={() => setOpen(i + 1)} className="aspect-video w-full" />
          ))}
        </div>
      )}
      {open !== null && <MediaViewer items={items} startIndex={open} onClose={() => setOpen(null)} />}
    </div>
  );
}
