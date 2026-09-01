import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { hotelService } from "@/server/modules/hotel/service";
import { Card, Container } from "@/components/ui/card";
import { StaggerGroup, StaggerItem } from "@/components/effects/scroll-reveal";
import { ModuleHero } from "@/components/site/module-hero";
import { CardArrow } from "@/components/site/card-arrow";
import { RatingBadge } from "@/components/site/rating-badge";
import { reviewService } from "@/server/modules/review/service";

export const metadata: Metadata = {
  title: "Hotels in Bir Billing — Stay Near the Landing Site",
  description:
    "Comfortable hotels and stays in Bir Billing, Himachal Pradesh — from budget bunks to deluxe rooms, minutes from the paragliding landing site. Book alongside your flight or course.",
  alternates: { canonical: "/hotels" },
};

export default async function HotelsListPage() {
  const { items } = await hotelService.listPublic({ page: 1, pageSize: 50 });
  const ratings = await reviewService.getRatingSummaries(
    "HOTEL",
    items.map((hotel) => hotel.id),
  );

  return (
    <div className="relative overflow-hidden">
      <ModuleHero
        image="https://images.unsplash.com/photo-1746549859840-808544238d42?q=80&w=1920&h=1080&auto=format&fit=crop"
        imageAlt="A cosy, warmly-lit hotel room"
        eyebrow="Where to stay"
        title="Hotels"
        subtitle="Comfortable stays near the takeoff site — from budget bunks to deluxe rooms, bookable alongside your flight or course in the same checkout."
        highlights={["Steps from the landing site", "Bunk to deluxe rooms", "Flexible cancellation"]}
        effect="orbs"
      />

      <Container className="relative z-10 py-16">
        {items.length === 0 ? (
          <p className="mt-12 text-muted">No hotels are available right now.</p>
        ) : (
          <StaggerGroup className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {items.map((hotel) => (
              <StaggerItem key={hotel.id}>
                <Link href={`/hotels/${hotel.slug}`} className="group">
                  <Card className="card-glow-hover h-full overflow-hidden">
                    <div className="relative h-44 w-full">
                      <Image
                        src={hotel.media[0]?.url ?? "/placeholder.svg"}
                        alt={hotel.name}
                        fill
                        className="object-cover"
                      />
                      <CardArrow />
                    </div>
                    <div className="p-6">
                      <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold">{hotel.name}</h2>
                        {ratings.get(hotel.id) && (
                          <RatingBadge average={ratings.get(hotel.id)!.average} count={ratings.get(hotel.id)!.count} />
                        )}
                      </div>
                      <p className="mt-1 text-sm text-muted">{hotel.city}</p>
                      <p className="mt-2 line-clamp-2 text-sm text-muted">{hotel.description}</p>
                    </div>
                  </Card>
                </Link>
              </StaggerItem>
            ))}
          </StaggerGroup>
        )}
      </Container>
    </div>
  );
}
