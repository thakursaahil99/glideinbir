import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { itemService, slotService } from "@/server/modules/adventure/service";
import { getCurrentUser } from "@/server/auth/guards";
import { Card, Badge } from "@/components/ui/card";
import { BookAdventureWidget } from "@/components/site/book-adventure-widget";
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
    const item = await itemService.getBySlug(slug);
    return {
      title: `${item.title} — Bir Billing Adventure`,
      description:
        item.shortDescription ?? `${item.title} in ${item.location}, Bir Billing. ${item.description.slice(0, 140)}`,
      alternates: { canonical: `/adventure/${slug}` },
    };
  } catch {
    return { title: "Adventure" };
  }
}

export default async function AdventureDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const [item, user, slots] = await Promise.all([
    itemService.getBySlug(slug).catch(() => null),
    getCurrentUser(),
    slotService.listForItemSlug(slug).catch(() => []),
  ]);
  if (!item) notFound();

  const galleryImages = item.media.length > 0 ? item.media.map((m) => m.url) : ["/placeholder.svg"];

  return (
    <DetailSplit
      images={galleryImages}
      breadcrumbs={[{ label: "Adventure", href: "/adventure" }, { label: item.title }]}
      imageAlt={item.title}
      badge={<Badge tone="success">{item.category.name}</Badge>}
      title={item.title}
      subtitle={`${item.location} · ${item.durationLabel}`}
      price={formatINR(item.price.toString())}
      priceUnit={item.pricingUnit.replace("_", " ").toLowerCase()}
      sidebar={
        <Card className="p-6">
          <div className="text-2xl font-bold">
            <GradientText>{formatINR(item.price.toString())}</GradientText>
          </div>
          <p className="text-sm text-muted">{item.pricingUnit.replace("_", " ").toLowerCase()}</p>
          <div className="mt-6">
            <BookAdventureWidget
              itemId={item.id}
              unitPrice={item.price.toNumber()}
              pricingUnit={item.pricingUnit}
              isLoggedIn={Boolean(user)}
              customer={user ? { name: user.name, email: user.email, phone: user.phone } : undefined}
              slots={slots.map((slot) => ({
                id: slot.id,
                date: slot.date.toISOString(),
                capacity: slot.capacity,
                bookedUnits: slot.bookedUnits,
              }))}
            />
          </div>
        </Card>
      }
    >
      <p className="whitespace-pre-line text-ink">{item.description}</p>
    </DetailSplit>
  );
}
