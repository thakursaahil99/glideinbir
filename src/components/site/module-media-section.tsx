import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, Camera, Film } from "lucide-react";
import { Container } from "@/components/ui/card";
import { ScrollReveal } from "@/components/effects/scroll-reveal";
import { PhotoMosaic } from "@/components/media/photo-mosaic";
import { ReelsStrip } from "@/components/media/reels-strip";
import { VideoShowcase } from "@/components/media/video-showcase";
import { SectionHeader } from "./section-header";
import { moduleMedia } from "@/lib/stock-videos";
import type { VideoTag } from "@/content/media-videos";
import type { ModuleKey } from "@/lib/module-theme";

// "Photos, videos & reels" band for a module's list page (paragliding,
// courses, stays, adventure, travel): a photo mosaic, a featured clip with
// two more beside it, and a row of reels — all picked by the module's tags,
// placeholder media until real footage is uploaded.
export function ModuleMediaSection({
  tags,
  tone,
  band,
  eyebrow,
  title,
  description,
}: {
  tags: VideoTag[];
  tone: ModuleKey;
  band: string;
  eyebrow: string;
  title: ReactNode;
  description: string;
}) {
  const { photos, videos, reels } = moduleMedia(tags);
  const galleryHref = `/gallery?tag=${tags[0]}`;

  return (
    <section className={`${band} border-y border-border py-16 md:py-20`}>
      <Container>
        <ScrollReveal>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionHeader eyebrow={eyebrow} icon={Camera} tone={tone} title={title} description={description} />
            <Link
              href={galleryHref}
              className="inline-flex items-center gap-1 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
            >
              See all in the gallery <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </ScrollReveal>

        {photos.length > 0 && (
          <ScrollReveal className="mt-10">
            <PhotoMosaic photos={photos} href={galleryHref} />
          </ScrollReveal>
        )}

        {videos.length > 0 && (
          <ScrollReveal className="mt-10">
            <VideoShowcase items={videos} />
          </ScrollReveal>
        )}

        {reels.length > 0 && (
          <ScrollReveal className="mt-12">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-bold">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-fuchsia-500 to-orange-400 text-white">
                <Film className="h-4 w-4" />
              </span>
              Reels
            </h3>
            <ReelsStrip items={reels} />
          </ScrollReveal>
        )}

        <p className="mt-6 text-xs text-muted">
          Placeholder photos and clips from Wikimedia Commons (free licences) — credits are shown inside
          each clip and in public/stock/CREDITS.md.
        </p>
      </Container>
    </section>
  );
}
