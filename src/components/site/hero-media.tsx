import { existsSync } from "node:fs";
import { join } from "node:path";
import Image from "next/image";

// Homepage hero background. If a video is available it plays muted on a
// loop behind the text; otherwise the still image shows. To use a video,
// EITHER drop a file at public/hero.mp4 (and optionally public/hero.webm)
// OR set NEXT_PUBLIC_HERO_VIDEO_URL to a direct video URL. The still
// (public/hero.webp) is always the poster / fallback.
const LOCAL_MP4 = existsSync(join(process.cwd(), "public", "hero.mp4"));
const LOCAL_WEBM = existsSync(join(process.cwd(), "public", "hero.webm"));
const REMOTE = process.env.NEXT_PUBLIC_HERO_VIDEO_URL;

export function HeroMedia({ alt }: { alt: string }) {
  if (REMOTE || LOCAL_MP4 || LOCAL_WEBM) {
    return (
      <video
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        poster="/hero.webp"
        aria-label={alt}
      >
        {REMOTE && <source src={REMOTE} />}
        {LOCAL_WEBM && <source src="/hero.webm" type="video/webm" />}
        {LOCAL_MP4 && <source src="/hero.mp4" type="video/mp4" />}
      </video>
    );
  }

  return (
    <Image src="/hero.webp" alt={alt} fill priority sizes="100vw" className="object-cover" />
  );
}
