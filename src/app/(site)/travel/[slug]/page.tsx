import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { routeService, slotService } from "@/server/modules/travel/service";
import { getCurrentUser } from "@/server/auth/guards";
import { Card, Badge } from "@/components/ui/card";
import { BookTravelWidget } from "@/components/site/book-travel-widget";
import { DetailSplit } from "@/components/site/detail-split";
import { formatINR } from "@/lib/format";
import { GradientText } from "@/components/effects/gradient-text";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const route = await routeService.getBySlug(slug);
    return {
      title: `${route.title} — Travel to Bir Billing`,
      description: `${route.title}: ${route.fromLocation} to ${route.toLocation}. ${route.description.slice(0, 140)}`,
      alternates: { canonical: `/travel/${slug}` },
    };
  } catch {
    return { title: "Travel" };
  }
}

export default async function TravelDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const [route, user, slots] = await Promise.all([
    routeService.getBySlug(slug).catch(() => null),
    getCurrentUser(),
    slotService.listForRouteSlug(slug).catch(() => []),
  ]);
  if (!route) notFound();

  const galleryImages = route.media.length > 0 ? route.media.map((m) => m.url) : ["/placeholder.svg"];

  return (
    <DetailSplit
      images={galleryImages}
      breadcrumbs={[{ label: "Travel", href: "/travel" }, { label: route.title }]}
      imageAlt={route.title}
      badge={<Badge>{route.mode}</Badge>}
      title={route.title}
      subtitle={`${route.fromLocation} → ${route.toLocation} · ${route.vehicleType} · ${route.durationLabel}`}
      price={formatINR(route.price.toString())}
      priceUnit={route.pricingUnit.replace("_", " ").toLowerCase()}
      sidebar={
        <Card className="p-6">
          <div className="text-2xl font-bold">
            <GradientText>{formatINR(route.price.toString())}</GradientText>
          </div>
          <p className="text-sm text-muted">{route.pricingUnit.replace("_", " ").toLowerCase()}</p>
          <div className="mt-6">
            <BookTravelWidget
              routeId={route.id}
              unitPrice={route.price.toNumber()}
              isLoggedIn={Boolean(user)}
              customer={user ? { name: user.name, email: user.email, phone: user.phone } : undefined}
              slots={slots.map((slot) => ({
                id: slot.id,
                date: slot.date.toISOString(),
                departureTime: slot.departureTime,
                capacity: slot.capacity,
                bookedSeats: slot.bookedSeats,
              }))}
            />
          </div>
        </Card>
      }
    >
      <p className="whitespace-pre-line text-ink">{route.description}</p>
    </DetailSplit>
  );
}
