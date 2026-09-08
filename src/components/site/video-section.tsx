import { Container } from "@/components/ui/card";
import { SectionHeader } from "./section-header";
import { Play } from "lucide-react";

// "Watch a flight" — embeds a YouTube video when NEXT_PUBLIC_FLIGHT_VIDEO_ID
// is set (the id is the bit after ?v= in a YouTube URL). Renders nothing
// when unset, so the homepage stays clean until there's a video to show.
export function VideoSection({ videoId }: { videoId?: string }) {
  if (!videoId) return null;

  return (
    <div className="border-y border-border bg-ink text-white">
      <Container className="py-16">
        <SectionHeader
          eyebrow="See it first"
          icon={Play}
          title="Watch a flight over Bir Billing"
        />
        <div className="mt-8 overflow-hidden rounded-2xl border border-white/10 bg-black">
          <div className="relative aspect-video">
            <iframe
              className="absolute inset-0 h-full w-full"
              src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}`}
              title="Paragliding in Bir Billing"
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        </div>
      </Container>
    </div>
  );
}
