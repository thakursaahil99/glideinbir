import Link from "next/link";
import { requireUserForPage } from "@/server/auth/guards";
import { bookingService } from "@/server/modules/booking/service";
import { Container, Card, Badge } from "@/components/ui/card";
import { formatDate, formatINR } from "@/lib/format";

function itemSummary(booking: Awaited<ReturnType<typeof bookingService.listForUser>>[number]) {
  const parts: string[] = [];
  if (booking.paraglidingItems.length) {
    parts.push(booking.paraglidingItems.map((i) => i.package.title).join(", "));
  }
  if (booking.schoolItems.length) {
    parts.push(booking.schoolItems.map((i) => i.course.title).join(", "));
  }
  if (booking.hotelItems.length) {
    parts.push(booking.hotelItems.map((i) => i.hotel.name).join(", "));
  }
  return parts.join(" + ");
}

export default async function AccountBookingsPage() {
  const user = await requireUserForPage("/account/bookings");
  const bookings = await bookingService.listForUser(user.id);

  return (
    <Container className="max-w-3xl py-16">
      <h1 className="text-2xl font-bold tracking-tight">My bookings</h1>

      {bookings.length === 0 ? (
        <p className="mt-8 text-muted">You haven&apos;t booked anything yet.</p>
      ) : (
        <div className="mt-8 space-y-4">
          {bookings.map((booking) => (
            <Link key={booking.id} href={`/booking/${booking.id}`}>
              <Card className="flex items-center justify-between p-5 transition-shadow hover:shadow-md">
                <div>
                  <p className="font-medium">{itemSummary(booking)}</p>
                  <p className="text-sm text-muted">
                    {booking.bookingNumber} · {formatDate(booking.createdAt)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{formatINR(booking.totalAmount.toString())}</p>
                  <Badge>{booking.status}</Badge>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </Container>
  );
}
