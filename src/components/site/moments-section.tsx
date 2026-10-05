import Link from "next/link";
import { ArrowRight, Camera, Film } from "lucide-react";
import { Container } from "@/components/ui/card";
import { ScrollReveal } from "@/components/effects/scroll-reveal";
import { PhotoMosaic } from "@/components/media/photo-mosaic";
import { ReelsStrip } from "@/components/media/reels-strip";
import { VideoShowcase } from "@/components/media/video-showcase";
import { SectionHeader } from "./section-header";
import { ALL_PHOTOS, ALL_REELS, ALL_VIDEOS } from "@/lib/stock-videos";

// Homepage "Moments from Bir": a photo mosaic, a featured flight video with
// two more clips, and a row of reels — placeholder media until real footage
// is uploaded.
export function MomentsSection() {
  const featured = ["billing-glide", "paragliding-india", "deodar-meadow"]
    .map((id) => ALL_VIDEOS.find((v) => v.id === id))
    .filter((v): v is NonNullable<typeof v> => Boolean(v));
  const reels = ["shishiku-glide", "kullu-bike", "goats", "sundarnagar-road", "landscape-reel", "palanquin"]
    .map((id) => ALL_REELS.find((v) => v.id === id))
    .filter((v): v is NonNullable<typeof v> => Boolean(v));
  const mosaic = [
    "fly-bir-hp",
    "bir-dhauladhar",
    "camp-triund",
    "stay-cottage",
    "school-pilots",
    "trek-triund-hill",
    "bir-monastery",
  ]
    .map((name) => ALL_PHOTOS.find((p) => p.src.endsWith(`/${name}.webp`))?.src)
    .filter((src): src is string => Boolean(src));

  return (
    <section className="band-sunset border-y border-border py-20 md:py-24">
      <Container>
        <ScrollReveal>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionHeader
              eyebrow="Moments from Bir"
              icon={Camera}
              title={
                <>
                  Sky, trails & <span className="gradient-text">campfires</span>
                </>
              }
              description="Photos, videos and reels from the launch site, the valley and the road in."
            />
            <Link
              href="/gallery"
              className="inline-flex items-center gap-1 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
            >
              Open the gallery <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </ScrollReveal>

        <ScrollReveal className="mt-10">
          <PhotoMosaic photos={mosaic} />
        </ScrollReveal>

        <ScrollReveal className="mt-10">
          <VideoShowcase items={featured} />
        </ScrollReveal>

        <ScrollReveal className="mt-12">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-bold">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-fuchsia-500 to-orange-400 text-white">
              <Film className="h-4 w-4" />
            </span>
            Reels from the valley
          </h3>
          <ReelsStrip items={reels} />
        </ScrollReveal>
      </Container>
    </section>
  );
}
