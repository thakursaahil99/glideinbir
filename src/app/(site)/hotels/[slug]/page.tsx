import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hotelService } from "@/server/modules/hotel/service";
import { getCurrentUser } from "@/server/auth/guards";
import { Container, Card, Badge } from "@/components/ui/card";
import { BookHotelWidget } from "@/components/site/book-hotel-widget";
import { DetailSplit } from "@/components/site/detail-split";
import { ReviewsSection } from "@/components/site/reviews-section";
import { FaqSection } from "@/components/site/faq-section";
import { ScrollReveal } from "@/components/effects/scroll-reveal";
import { Clock, MapPin, Sparkles } from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const hotel = await hotelService.getBySlug(slug);
    return {
      title: `${hotel.name} — Hotel in Bir Billing`,
      description: `${hotel.name} in ${hotel.city}, Bir Billing. ${hotel.description.slice(0, 140)}`,
      alternates: { canonical: `/hotels/${slug}` },
    };
  } catch {
    return { title: "Hotels" };
  }
}

export default async function HotelDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const [hotel, user] = await Promise.all([
    hotelService.getBySlug(slug).catch(() => null),
    getCurrentUser(),
  ]);
  if (!hotel) notFound();

  const galleryImages = hotel.media.length > 0 ? hotel.media.map((m) => m.url) : ["/placeholder.svg"];

  return (
    <>
      <DetailSplit
        images={galleryImages}
        imageAlt={hotel.name}
        title={hotel.name}
        subtitle={`${hotel.address}, ${hotel.city}`}
        sidebar={
          <Card className="p-6">
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <Clock className="h-4 w-4 text-brand" /> Check-in / Check-out
            </h2>
            <p className="mt-1 text-sm text-muted">
              {hotel.checkInTime} · {hotel.checkOutTime}
            </p>
            <h2 className="mt-5 flex items-center gap-2 text-sm font-semibold">
              <MapPin className="h-4 w-4 text-brand" /> Location
            </h2>
            <p className="mt-1 text-sm text-muted">{hotel.city}</p>
            {hotel.amenities.length > 0 && (
              <>
                <h2 className="mt-5 flex items-center gap-2 text-sm font-semibold">
                  <Sparkles className="h-4 w-4 text-brand" /> Amenities
                </h2>
                <div className="mt-2 flex flex-wrap gap-2">
                  {hotel.amenities.map(({ amenity }) => (
                    <Badge key={amenity.id}>{amenity.name}</Badge>
                  ))}
                </div>
              </>
            )}
          </Card>
        }
      >
        <p className="whitespace-pre-line text-ink">{hotel.description}</p>
      </DetailSplit>

      <Container className="pb-16">
        <ScrollReveal>
          <h2 className="text-xl font-semibold">Rooms</h2>
          <div className="mt-4">
            {hotel.rooms.length === 0 ? (
              <p className="text-muted">No rooms are listed for this hotel yet.</p>
            ) : (
              <BookHotelWidget
                hotelId={hotel.id}
                isLoggedIn={Boolean(user)}
                customer={user ? { name: user.name, email: user.email, phone: user.phone } : undefined}
                rooms={hotel.rooms.map((room) => ({
                  id: room.id,
                  name: room.name,
                  type: room.type,
                  occupancyAdults: room.occupancyAdults,
                  occupancyChildren: room.occupancyChildren,
                  pricePerNight: room.pricePerNight.toNumber(),
                  totalRooms: room.totalRooms,
                  image: room.media[0]?.url ?? "/placeholder.svg",
                }))}
              />
            )}
          </div>
        </ScrollReveal>

        <FaqSection category="HOTEL" targetId={hotel.id} />
        <ReviewsSection targetType="HOTEL" targetId={hotel.id} />
      </Container>
    </>
  );
}
