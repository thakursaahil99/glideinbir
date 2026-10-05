import type { Metadata } from "next";
import { Camera } from "lucide-react";
import { Container } from "@/components/ui/card";
import { SectionHeader } from "@/components/site/section-header";
import { GalleryClient } from "@/components/media/gallery-client";
import { ScrollReveal } from "@/components/effects/scroll-reveal";
import { ALL_PHOTOS, ALL_REELS, ALL_VIDEOS, TAG_LABEL } from "@/lib/stock-videos";

export const metadata: Metadata = {
  title: "Gallery — Photos, Videos & Reels from Bir Billing",
  description:
    "Paragliding flights, Himalayan treks, camping nights, cosy stays and mountain roads — photos, videos and reels from Bir Billing and around.",
  alternates: { canonical: "/gallery" },
};

export default function GalleryPage() {
  return (
    <div className="band-sunset">
      <Container className="py-14 md:py-20">
        <ScrollReveal>
          <SectionHeader
            eyebrow="Gallery"
            icon={Camera}
            title={
              <>
                Bir Billing, <span className="gradient-text">through the lens</span>
              </>
            }
            description="Flights, treks, camp nights and mountain roads — photos, videos and reels. Tap anything to open it."
          />
        </ScrollReveal>
        <div className="mt-10">
          <GalleryClient photos={ALL_PHOTOS} videos={ALL_VIDEOS} reels={ALL_REELS} tagLabels={TAG_LABEL} />
        </div>
        <p className="mt-10 text-xs text-muted">
          Placeholder photos and clips from Wikimedia Commons under free licences — credits are in the
          viewer and in the site&apos;s public/stock/CREDITS.md.
        </p>
      </Container>
    </div>
  );
}
