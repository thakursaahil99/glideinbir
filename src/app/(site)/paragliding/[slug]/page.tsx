import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { packageService, slotService } from "@/server/modules/paragliding/service";
import { getCurrentUser } from "@/server/auth/guards";
import { Card, Badge } from "@/components/ui/card";
import { BookParaglidingWidget } from "@/components/site/book-paragliding-widget";
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
    const pkg = await packageService.getBySlug(slug);
    return {
      title: `${pkg.title} — Bir Billing Paragliding`,
      description:
        pkg.shortDescription ?? `${pkg.title} in Bir Billing, Himachal Pradesh. ${pkg.description.slice(0, 140)}`,
      alternates: { canonical: `/paragliding/${slug}` },
    };
  } catch {
    return { title: "Paragliding" };
  }
}

export default async function ParaglidingDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const [pkg, user] = await Promise.all([
    packageService.getBySlug(slug).catch(() => null),
    getCurrentUser(),
  ]);
  if (!pkg) notFound();

  const slots = await slotService.listForPackageSlug(slug);

  const coverImage = pkg.media[0]?.url ?? "/placeholder.svg";

  return (
    <DetailSplit
      image={coverImage}
      imageAlt={pkg.title}
      badge={<Badge>{pkg.flightType.replace("_", " ")}</Badge>}
      title={pkg.title}
      subtitle={`${pkg.location} · ${pkg.durationMinutes} minutes`}
      sidebar={
        <Card className="p-6">
          <div className="text-2xl font-bold">
            <GradientText>{formatINR(pkg.price.toString())}</GradientText>
          </div>
          <p className="text-sm text-muted">per person</p>
          <div className="mt-6">
            <BookParaglidingWidget
              packageId={pkg.id}
              pricePerPerson={pkg.price.toNumber()}
              isLoggedIn={Boolean(user)}
              customer={user ? { name: user.name, email: user.email, phone: user.phone } : undefined}
              slots={slots.map((slot) => ({
                id: slot.id,
                date: slot.date.toISOString(),
                startTime: slot.startTime,
                capacity: slot.capacity,
                bookedSeats: slot.bookedSeats,
              }))}
            />
          </div>
        </Card>
      }
    >
      <p className="whitespace-pre-line text-ink">{pkg.description}</p>

      {pkg.safetyInfo && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold">Safety information</h2>
          <p className="mt-2 text-sm text-muted">{pkg.safetyInfo}</p>
        </div>
      )}
    </DetailSplit>
  );
}
