"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Film, Image as ImageIcon, PlayCircle, X } from "lucide-react";
import { clsx } from "clsx";
import type { MediaVideo, VideoTag } from "@/content/media-videos";
import { PreviewVideo } from "./preview-video";
import { MediaViewer } from "./media-viewer";

type Photo = { src: string; tag: VideoTag };
type Tab = "photos" | "videos" | "reels";

const TABS: { id: Tab; label: string; icon: typeof ImageIcon; color: string }[] = [
  { id: "photos", label: "Photos", icon: ImageIcon, color: "from-sky-500 to-cyan-400" },
  { id: "videos", label: "Videos", icon: PlayCircle, color: "from-violet-500 to-fuchsia-500" },
  { id: "reels", label: "Reels", icon: Film, color: "from-orange-500 to-pink-500" },
];

const TAG_COLOR: Record<VideoTag, string> = {
  flight: "bg-sky-500",
  school: "bg-violet-500",
  hotel: "bg-emerald-500",
  camping: "bg-amber-500",
  trekking: "bg-lime-600",
  adventure: "bg-rose-500",
  travel: "bg-cyan-600",
  bir: "bg-fuchsia-500",
};

export function GalleryClient({
  photos,
  videos,
  reels,
  tagLabels,
  initialTag = "all",
}: {
  photos: Photo[];
  videos: MediaVideo[];
  reels: MediaVideo[];
  tagLabels: Record<VideoTag, string>;
  /** Pre-selected filter, e.g. from /gallery?tag=flight. */
  initialTag?: VideoTag | "all";
}) {
  const [tab, setTab] = useState<Tab>("photos");
  const [tag, setTag] = useState<VideoTag | "all">(initialTag);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [viewer, setViewer] = useState<number | null>(null);

  const fPhotos = photos.filter((p) => tag === "all" || p.tag === tag);
  const fVideos = videos.filter((v) => tag === "all" || v.tags.includes(tag));
  const fReels = reels.filter((v) => tag === "all" || v.tags.includes(tag));
  const counts = { photos: fPhotos.length, videos: fVideos.length, reels: fReels.length };

  const tags = (Object.keys(tagLabels) as VideoTag[]).filter((t) =>
    tab === "photos"
      ? photos.some((p) => p.tag === t)
      : (tab === "videos" ? videos : reels).some((v) => v.tags.includes(t)),
  );

  useEffect(() => {
    if (lightbox === null) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setLightbox(null);
      if (e.key === "ArrowRight") setLightbox((i) => (i === null ? i : (i + 1) % fPhotos.length));
      if (e.key === "ArrowLeft") setLightbox((i) => (i === null ? i : (i - 1 + fPhotos.length) % fPhotos.length));
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [lightbox, fPhotos.length]);

  const shownPhoto = lightbox !== null ? fPhotos[lightbox] : null;

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        {TABS.map(({ id, label, icon: Icon, color }) => (
          <button
            key={id}
            type="button"
            onClick={() => {
              setTab(id);
              setTag("all");
            }}
            className={clsx(
              "inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all",
              tab === id
                ? `bg-gradient-to-r ${color} text-white shadow-lg`
                : "border border-border bg-paper text-ink hover:border-brand/50",
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
            <span className={clsx("rounded-full px-2 text-xs", tab === id ? "bg-white/25" : "bg-surface text-muted")}>
              {id === "photos" ? photos.length : id === "videos" ? videos.length : reels.length}
            </span>
          </button>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {(["all", ...tags] as (VideoTag | "all")[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTag(t)}
            className={clsx(
              "rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors",
              tag === t
                ? "border-transparent bg-ink text-white"
                : "border-border bg-paper text-muted hover:text-ink",
            )}
          >
            {t === "all" ? "All" : tagLabels[t]}
          </button>
        ))}
      </div>

      <div className="mt-8">
        {tab === "photos" && (
          <div className="columns-2 gap-3 sm:columns-3 lg:columns-4 [&>*]:mb-3">
            {fPhotos.map((p, i) => (
              <button
                key={p.src}
                type="button"
                onClick={() => setLightbox(i)}
                className="group relative block w-full overflow-hidden rounded-2xl bg-surface shadow-md"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.src}
                  alt={tagLabels[p.tag]}
                  loading="lazy"
                  className="w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <span
                  className={clsx(
                    "absolute left-2 top-2 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow",
                    TAG_COLOR[p.tag],
                  )}
                >
                  {tagLabels[p.tag]}
                </span>
              </button>
            ))}
          </div>
        )}

        {tab === "videos" && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {fVideos.map((v, i) => (
              <button
                key={v.id}
                type="button"
                onClick={() => setViewer(i)}
                className="group relative aspect-video overflow-hidden rounded-2xl bg-ink text-left shadow-lg"
              >
                <PreviewVideo
                  video={v}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <span className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <span className="absolute left-1/2 top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-brand shadow-xl transition-transform group-hover:scale-110">
                  <PlayCircle className="h-6 w-6" />
                </span>
                <span className="absolute inset-x-3 bottom-3 text-sm font-semibold text-white drop-shadow">{v.label}</span>
              </button>
            ))}
          </div>
        )}

        {tab === "reels" && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {fReels.map((v, i) => (
              <button
                key={v.id}
                type="button"
                onClick={() => setViewer(i)}
                className="group relative aspect-[9/16] overflow-hidden rounded-2xl bg-ink text-left shadow-lg"
              >
                <PreviewVideo
                  video={v}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <span className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/20" />
                <span className="absolute left-3 top-3 rounded-full bg-gradient-to-r from-fuchsia-500 to-orange-400 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                  Reel
                </span>
                <span className="absolute inset-x-3 bottom-3 text-sm font-semibold leading-tight text-white drop-shadow">
                  {v.label}
                </span>
              </button>
            ))}
          </div>
        )}

        {counts[tab] === 0 && <p className="py-12 text-center text-muted">Nothing here yet — try another filter.</p>}
      </div>

      {shownPhoto && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/92 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          onClick={() => setLightbox(null)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={shownPhoto.src}
            alt={tagLabels[shownPhoto.tag]}
            className="max-h-[90svh] max-w-[94vw] rounded-2xl object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            type="button"
            onClick={() => setLightbox(null)}
            aria-label="Close"
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25"
          >
            <X className="h-5 w-5" />
          </button>
          {fPhotos.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightbox((i) => (i === null ? i : (i - 1 + fPhotos.length) % fPhotos.length));
                }}
                aria-label="Previous photo"
                className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightbox((i) => (i === null ? i : (i + 1) % fPhotos.length));
                }}
                aria-label="Next photo"
                className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}
        </div>
      )}

      {viewer !== null && (
        <MediaViewer
          items={tab === "reels" ? fReels : fVideos}
          startIndex={viewer}
          onClose={() => setViewer(null)}
        />
      )}
    </div>
  );
}
