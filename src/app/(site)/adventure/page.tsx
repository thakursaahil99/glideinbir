import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { clsx } from "clsx";
import { itemService, categoryService } from "@/server/modules/adventure/service";
import { Card, Container, Badge } from "@/components/ui/card";
import { formatINR } from "@/lib/format";
import { StaggerGroup, StaggerItem } from "@/components/effects/scroll-reveal";
import { ModuleHero } from "@/components/site/module-hero";
import { CardArrow } from "@/components/site/card-arrow";

export const metadata: Metadata = { title: "Adventure" };

export default async function AdventureListPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const [{ items }, categories] = await Promise.all([
    itemService.listPublic({ page: 1, pageSize: 50, ...(category ? { categorySlug: category } : {}) }),
    categoryService.list(),
  ]);

  return (
    <>
      <ModuleHero
        image="https://images.unsplash.com/photo-1724405504642-39518cce855a?q=80&w=1920&h=1080&auto=format&fit=crop"
        imageAlt="Orange dome tents pitched below a snow-capped Himalayan peak"
        eyebrow="Beyond the flight"
        title="Adventure"
        subtitle="Camping, trekking, cottages, and more — Bir Billing's adventures beyond the flight, from a machaan tent for two to a 12-day expedition trek."
        highlights={["Camping to cottages", "Half-day to 12-day treks", "Bir Billing & beyond"]}
        effect="sparkles"
        shape={{ variant: "dodecahedron", color: "#22c55e", emissive: "#15803d" }}
      />

      <Container className="py-16">
        <div className="flex flex-wrap gap-2">
          <Link
            href="?"
            className={clsx(
              "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
              !category
                ? "border-brand bg-brand text-white"
                : "border-border text-muted hover:border-ink hover:text-ink",
            )}
          >
            All adventures
          </Link>
          {categories.map((cat) => {
            const active = category === cat.slug;
            return (
              <Link
                key={cat.id}
                href={`?category=${cat.slug}`}
                className={clsx(
                  "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                  active
                    ? "border-brand bg-brand text-white"
                    : "border-border text-muted hover:border-ink hover:text-ink",
                )}
              >
                {cat.name}
              </Link>
            );
          })}
        </div>

        {items.length === 0 ? (
          <p className="mt-12 text-muted">No adventures are available right now.</p>
        ) : (
          <StaggerGroup className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <StaggerItem key={item.id}>
                <Link href={`/adventure/${item.slug}`} className="group">
                  <Card className="h-full overflow-hidden transition-shadow hover:shadow-lg">
                    <div className="relative h-44 w-full">
                      <Image
                        src={item.media[0]?.url ?? `https://picsum.photos/seed/${item.slug}/800/600`}
                        alt=""
                        fill
                        className="object-cover"
                      />
                      <CardArrow />
                    </div>
                    <div className="p-6">
                      <Badge>{item.category.name}</Badge>
                      <h2 className="mt-3 text-lg font-semibold">{item.title}</h2>
                      <p className="mt-1 line-clamp-2 text-sm text-muted">
                        {item.shortDescription ?? item.description}
                      </p>
                      <div className="mt-4 flex items-baseline justify-between">
                        <span className="text-lg font-bold">{formatINR(item.price.toString())}</span>
                        <span className="text-xs text-muted">{item.durationLabel}</span>
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
