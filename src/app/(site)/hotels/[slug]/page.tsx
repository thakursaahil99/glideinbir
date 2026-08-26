import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { hotelService } from "@/server/modules/hotel/service";
import { getCurrentUser } from "@/server/auth/guards";
import { Container, Badge } from "@/components/ui/card";
import { BookHotelWidget } from "@/components/site/book-hotel-widget";
import { ScrollReveal } from "@/components/effects/scroll-reveal";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const hotel = await hotelService.getBySlug(slug);
    return { title: hotel.name };
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

  const coverImage = hotel.media[0]?.url ?? `https://picsum.photos/seed/${hotel.slug}/1600/900`;

  return (
    <Container className="py-16">
      <div className="relative h-72 w-full overflow-hidden rounded-2xl md:h-96">
        <Image src={coverImage} alt={hotel.name} fill priority className="object-cover" />
      </div>

      <ScrollReveal>
        <h1 className="mt-10 text-3xl font-bold tracking-tight">{hotel.name}</h1>
        <p className="mt-1 text-sm text-muted">{hotel.address}, {hotel.city}</p>

        <div className="mt-3 flex flex-wrap gap-2">
          {hotel.amenities.map(({ amenity }) => (
            <Badge key={amenity.id}>{amenity.name}</Badge>
          ))}
        </div>

        <p className="mt-6 max-w-3xl whitespace-pre-line text-ink">{hotel.description}</p>

        <p className="mt-4 text-sm text-muted">
          Check-in {hotel.checkInTime} · Check-out {hotel.checkOutTime}
        </p>
      </ScrollReveal>

      <div className="mt-10">
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
                image: room.media[0]?.url ?? `https://picsum.photos/seed/${room.id}/800/600`,
              }))}
            />
          )}
        </div>
      </div>
    </Container>
  );
}
