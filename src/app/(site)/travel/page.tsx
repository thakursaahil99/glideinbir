import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { clsx } from "clsx";
import { routeService } from "@/server/modules/travel/service";
import { Card, Container, Badge } from "@/components/ui/card";
import { formatINR } from "@/lib/format";
import { StaggerGroup, StaggerItem } from "@/components/effects/scroll-reveal";
import { ModuleHero } from "@/components/site/module-hero";
import { CardArrow } from "@/components/site/card-arrow";

export const metadata: Metadata = { title: "Travel" };

const MODES = [
  { value: undefined, label: "All routes" },
  { value: "BUS", label: "Bus" },
  { value: "TAXI", label: "Taxi" },
] as const;

export default async function TravelListPage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string }>;
}) {
  const { mode } = await searchParams;
  const { items } = await routeService.listPublic({
    page: 1,
    pageSize: 50,
    ...(mode ? { mode: mode as "BUS" | "TAXI" } : {}),
  });

  return (
    <>
      <ModuleHero
        image="https://images.unsplash.com/photo-1701666658058-6c5f60849c90?q=80&w=1920&h=1080&auto=format&fit=crop&crop=bottom"
        imageAlt="A winding road curving through a forested mountain valley"
        eyebrow="Getting there"
        title="Travel"
        subtitle="Volvo AC sleeper buses and door-to-door taxis to and from Bir Billing — booked alongside your flight, course, or stay."
        highlights={["Volvo AC Sleeper & taxi", "Delhi ↔ Bir Billing", "Door-to-door transfers"]}
        effect="none"
        shape={{ variant: "torus", color: "#6366f1", emissive: "#4338ca" }}
      />

      <Container className="py-16">
        <div className="flex flex-wrap gap-2">
          {MODES.map((m) => {
            const active = (mode ?? undefined) === m.value;
            return (
              <Link
                key={m.label}
                href={m.value ? `?mode=${m.value}` : "?"}
                className={clsx(
                  "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                  active
                    ? "border-brand bg-brand text-white"
                    : "border-border text-muted hover:border-ink hover:text-ink",
                )}
              >
                {m.label}
              </Link>
            );
          })}
        </div>

        {items.length === 0 ? (
          <p className="mt-12 text-muted">No routes are available right now.</p>
        ) : (
          <StaggerGroup className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {items.map((route) => (
              <StaggerItem key={route.id}>
                <Link href={`/travel/${route.slug}`} className="group">
                  <Card className="h-full overflow-hidden transition-shadow hover:shadow-lg">
                    <div className="relative h-44 w-full">
                      <Image
                        src={route.media[0]?.url ?? `https://picsum.photos/seed/${route.slug}/800/600`}
                        alt=""
                        fill
                        className="object-cover"
                      />
                      <CardArrow />
                    </div>
                    <div className="p-6">
                      <Badge>{route.mode}</Badge>
                      <h2 className="mt-3 text-lg font-semibold">{route.title}</h2>
                      <p className="mt-1 text-sm text-muted">
                        {route.fromLocation} → {route.toLocation}
                      </p>
                      <div className="mt-4 flex items-baseline justify-between">
                        <span className="text-lg font-bold">{formatINR(route.price.toString())}</span>
                        <span className="text-xs text-muted">{route.durationLabel}</span>
                      </div>
                    </div>
                  </Card>
                </Link>
              </StaggerItem>
            ))}
          </StaggerGroup>
        )}
      </Container>
    </>
  );
}
