import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { packageService, slotService } from "@/server/modules/paragliding/service";
import { getCurrentUser } from "@/server/auth/guards";
import { Card, Container, Badge } from "@/components/ui/card";
import { BookParaglidingWidget } from "@/components/site/book-paragliding-widget";
import { formatINR } from "@/lib/format";
import { ScrollReveal } from "@/components/effects/scroll-reveal";
import { GradientText } from "@/components/effects/gradient-text";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const pkg = await packageService.getBySlug(slug);
    return { title: pkg.title, description: pkg.shortDescription ?? undefined };
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

  const coverImage = pkg.media[0]?.url ?? `https://picsum.photos/seed/${pkg.slug}/1600/900`;

  return (
    <Container className="py-16">
      <div className="relative h-72 w-full overflow-hidden rounded-2xl md:h-96">
        <Image src={coverImage} alt={pkg.title} fill priority className="object-cover" />
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1.6fr_1fr]">
      <ScrollReveal>
        <Badge>{pkg.flightType.replace("_", " ")}</Badge>
        <h1 className="mt-3 text-3xl font-bold tracking-tight">{pkg.title}</h1>
        <p className="mt-1 text-sm text-muted">
          {pkg.location} · {pkg.durationMinutes} minutes
        </p>

        <p className="mt-6 whitespace-pre-line text-ink">{pkg.description}</p>

        {pkg.includes.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-semibold">What&apos;s included</h2>
            <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-muted">
              {pkg.includes.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        {pkg.requirements.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-semibold">Requirements</h2>
            <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-muted">
              {pkg.requirements.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        {pkg.safetyInfo && (
          <div className="mt-8">
            <h2 className="text-lg font-semibold">Safety information</h2>
            <p className="mt-2 text-sm text-muted">{pkg.safetyInfo}</p>
          </div>
        )}
      </ScrollReveal>

      <div>
        <Card className="sticky top-24 p-6">
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
      </div>
      </div>
    </Container>
  );
}
