import Link from "next/link";
import { ArrowRight, Clapperboard, Film } from "lucide-react";
import { Container } from "@/components/ui/card";
import { ScrollReveal } from "@/components/effects/scroll-reveal";
import { ReelsStrip } from "@/components/media/reels-strip";
import { VideoShowcase } from "@/components/media/video-showcase";
import { SectionHeader } from "./section-header";
import { mediaFor } from "@/lib/stock-videos";
import type { StockKind } from "@/lib/stock-photos";
import type { ModuleKey } from "@/lib/module-theme";

// "Photos & videos" band for a detail page: a featured clip with two more
// beside it, then a row of reels — all picked from the item's name until
// real footage is uploaded.
export function MediaSection({
  kind,
  name,
  tone = "overview",
  band = "band-aurora",
}: {
  kind: StockKind;
  name: string;
  tone?: ModuleKey;
  band?: string;
}) {
  const { videos, reels } = mediaFor(kind, name);
  if (videos.length === 0 && reels.length === 0) return null;

  return (
    <section className={`${band} border-y border-border py-14 md:py-16`}>
      <Container>
        <ScrollReveal>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionHeader
              eyebrow="Videos & reels"
              icon={Clapperboard}
              tone={tone}
              title={
                <>
                  See it <span className="gradient-text">in action</span>
                </>
              }
              description="Clips from the sky, the trails and the valley — tap any to play with sound."
            />
            <Link href="/gallery" className="inline-flex items-center gap-1 text-sm font-semibold text-brand hover:underline">
              Open the full gallery <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </ScrollReveal>

        {videos.length > 0 && (
          <ScrollReveal className="mt-8">
            <VideoShowcase items={videos} />
          </ScrollReveal>
        )}

        {reels.length > 0 && (
          <ScrollReveal className="mt-10">
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
          Placeholder footage from Wikimedia Commons (free licences) — the credit is shown inside each clip.
        </p>
      </Container>
    </section>
  );
}
