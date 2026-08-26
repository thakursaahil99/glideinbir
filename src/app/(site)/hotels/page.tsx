import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { hotelService } from "@/server/modules/hotel/service";
import { Card, Container } from "@/components/ui/card";
import { GradientOrb } from "@/components/effects/gradient-orb";
import { ScrollReveal, StaggerGroup, StaggerItem } from "@/components/effects/scroll-reveal";

export const metadata: Metadata = { title: "Hotels" };

export default async function HotelsListPage() {
  const { items } = await hotelService.listPublic({ page: 1, pageSize: 50 });

  return (
    <div className="relative overflow-hidden">
      <GradientOrb className="-top-20 -right-20" color="#22d3ee" size={360} />
      <GradientOrb className="top-40 -left-32" color="var(--color-brand)" size={300} />

      <Container className="relative z-10 py-16">
        <ScrollReveal>
          <h1 className="text-3xl font-bold tracking-tight">Hotels</h1>
          <p className="mt-2 max-w-xl text-muted">
            Comfortable stays near the takeoff site, bookable alongside your flight or course.
          </p>
        </ScrollReveal>

        {items.length === 0 ? (
          <p className="mt-12 text-muted">No hotels are available right now.</p>
        ) : (
          <StaggerGroup className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {items.map((hotel) => (
              <StaggerItem key={hotel.id}>
                <Link href={`/hotels/${hotel.slug}`}>
                  <Card className="card-glow-hover h-full overflow-hidden">
                    <div className="relative h-44 w-full">
                      <Image
                        src={hotel.media[0]?.url ?? `https://picsum.photos/seed/${hotel.slug}/800/600`}
                        alt=""
                        fill
                        className="object-cover"
                      />
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
