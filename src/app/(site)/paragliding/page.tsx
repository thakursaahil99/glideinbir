import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { packageService } from "@/server/modules/paragliding/service";
import { Card, Container, Badge } from "@/components/ui/card";
import { formatINR } from "@/lib/format";
import { ParticleField } from "@/components/effects/particle-field";
import { ShootingStars } from "@/components/effects/shooting-stars";
import { TextReveal } from "@/components/effects/text-reveal";
import { StaggerGroup, StaggerItem } from "@/components/effects/scroll-reveal";
import { TiltCard } from "@/components/effects/tilt-card";

export const metadata: Metadata = { title: "Paragliding" };

export default async function ParaglidingListPage() {
  const { items } = await packageService.listPublic({ page: 1, pageSize: 50 });

  return (
    <>
      <div className="relative overflow-hidden bg-ink py-20 text-white">
        <ParticleField variant="stars" density={70} />
        <ShootingStars />
        <Container className="relative z-10">
          <TextReveal
            as="h1"
            text="Tandem Paragliding"
            className="text-3xl font-bold tracking-tight md:text-4xl"
          />
          <p className="mt-3 max-w-xl text-white/70">
            Fly over the Bir Billing valley with a certified pilot. Pick a package and an
            available slot.
          </p>
        </Container>
      </div>

      <Container className="py-16">
        {items.length === 0 ? (
          <p className="text-muted">No packages are available right now.</p>
        ) : (
          <StaggerGroup className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {items.map((pkg) => (
              <StaggerItem key={pkg.id}>
                <TiltCard maxTilt={5} className="h-full">
                  <Link href={`/paragliding/${pkg.slug}`}>
                    <Card className="h-full overflow-hidden transition-shadow hover:shadow-lg">
                      <div className="relative h-44 w-full">
                        <Image
                          src={pkg.media[0]?.url ?? `https://picsum.photos/seed/${pkg.slug}/800/600`}
                          alt=""
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="p-6">
                        <Badge>{pkg.flightType.replace("_", " ")}</Badge>
                        <h2 className="mt-3 text-lg font-semibold">{pkg.title}</h2>
                        <p className="mt-1 line-clamp-2 text-sm text-muted">
                          {pkg.shortDescription ?? pkg.description}
                        </p>
                        <div className="mt-4 flex items-baseline justify-between">
                          <span className="text-lg font-bold">{formatINR(pkg.price.toString())}</span>
                          <span className="text-xs text-muted">{pkg.durationMinutes} min</span>
                        </div>
                      </div>
                    </Card>
                  </Link>
                </TiltCard>
              </StaggerItem>
            ))}
          </StaggerGroup>
        )}
      </Container>
    </>
  );
}
