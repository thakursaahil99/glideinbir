import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { hotelService } from "@/server/modules/hotel/service";
import { Card, Container } from "@/components/ui/card";
import { StaggerGroup, StaggerItem } from "@/components/effects/scroll-reveal";
import { ModuleHero } from "@/components/site/module-hero";
import { CardArrow } from "@/components/site/card-arrow";

export const metadata: Metadata = { title: "Hotels" };

export default async function HotelsListPage() {
  const { items } = await hotelService.listPublic({ page: 1, pageSize: 50 });

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
        shape={{ variant: "sphere", color: "#f59e0b", emissive: "#b45309" }}
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
                        src={hotel.media[0]?.url ?? `https://picsum.photos/seed/${hotel.slug}/800/600`}
                        alt=""
                        fill
                        className="object-cover"
                      />
                      <CardArrow />
                    </div>
                    <div className="p-6">
                      <h2 className="text-lg font-semibold">{hotel.name}</h2>
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
