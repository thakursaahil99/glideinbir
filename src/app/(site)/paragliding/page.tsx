import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { clsx } from "clsx";
import { packageService } from "@/server/modules/paragliding/service";
import { Card, Container, Badge } from "@/components/ui/card";
import { formatINR } from "@/lib/format";
import { StaggerGroup, StaggerItem } from "@/components/effects/scroll-reveal";
import { TiltCard } from "@/components/effects/tilt-card";
import { ModuleHero } from "@/components/site/module-hero";
import { CardArrow } from "@/components/site/card-arrow";

export const metadata: Metadata = { title: "Paragliding" };

const FLIGHT_TYPES = [
  { value: undefined, label: "All flights" },
  { value: "TANDEM", label: "Tandem" },
  { value: "SOLO", label: "Solo" },
  { value: "CROSS_COUNTRY", label: "Cross country" },
] as const;

export default async function ParaglidingListPage({
  searchParams,
}: {
  searchParams: Promise<{ flightType?: string }>;
}) {
  const { flightType } = await searchParams;
  const { items } = await packageService.listPublic({
    page: 1,
    pageSize: 50,
    ...(flightType ? { flightType: flightType as "TANDEM" | "SOLO" | "CROSS_COUNTRY" } : {}),
  });

  return (
    <>
      <ModuleHero
        image="https://images.unsplash.com/photo-1722253991955-7359db2e7e5e?q=80&w=1920&h=1080&auto=format&fit=crop"
        imageAlt="A paraglider flying over misty Himalayan peaks"
        eyebrow="Bir Billing, Himachal Pradesh"
        title="Tandem Paragliding"
        subtitle="Fly over the Bir Billing valley with a certified pilot — from a 15-minute joy ride to a full cross-country flight. Pick a package and an available slot."
        highlights={["8,000 ft launch to landing", "15 min to full-day flights", "BPA-certified pilots"]}
        effect="stars"
        shape={{ variant: "icosahedron" }}
      />

      <Container className="py-16">
        <div className="flex flex-wrap gap-2">
          {FLIGHT_TYPES.map((type) => {
            const active = (flightType ?? undefined) === type.value;
            return (
              <Link
                key={type.label}
                href={type.value ? `?flightType=${type.value}` : "?"}
                className={clsx(
                  "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                  active
                    ? "border-brand bg-brand text-white"
                    : "border-border text-muted hover:border-ink hover:text-ink",
                )}
              >
                {type.label}
              </Link>
            );
          })}
        </div>

        {items.length === 0 ? (
          <p className="mt-12 text-muted">No packages are available right now.</p>
        ) : (
          <StaggerGroup className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {items.map((pkg) => (
              <StaggerItem key={pkg.id}>
                <TiltCard maxTilt={5} className="h-full">
                  <Link href={`/paragliding/${pkg.slug}`} className="group">
                    <Card className="h-full overflow-hidden transition-shadow hover:shadow-lg">
                      <div className="relative h-44 w-full">
                        <Image
                          src={pkg.media[0]?.url ?? `https://picsum.photos/seed/${pkg.slug}/800/600`}
                          alt=""
                          fill
                          className="object-cover"
                        />
                        <CardArrow />
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
