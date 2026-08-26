import { notFound } from "next/navigation";
import Link from "next/link";
import { bookingService } from "@/server/modules/booking/service";
import { Card, Container, Badge } from "@/components/ui/card";
import { BookingActions } from "@/components/admin/booking-actions";
import { formatDate, formatINR } from "@/lib/format";

export default async function AdminBookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const booking = await bookingService
    .getById(id, "", true)
    .catch(() => null);
  if (!booking) notFound();

  return (
    <Container className="max-w-2xl px-0 py-0">
      <Link href="/admin/bookings" className="text-sm text-muted hover:text-ink">
        ← Back to bookings
      </Link>

      <div className="mt-2 flex items-center justify-between">
        <div>
          <p className="text-sm text-muted">Booking {booking.bookingNumber}</p>
          <h1 className="text-2xl font-bold tracking-tight">{booking.customerName}</h1>
          <p className="text-sm text-muted">
            {booking.customerEmail} · {booking.customerPhone}
          </p>
        </div>
        <Badge>{booking.status}</Badge>
      </div>

      <Card className="mt-6 divide-y divide-border p-6">
        {booking.paraglidingItems.map((item) => (
          <div key={item.id} className="py-4 first:pt-0 last:pb-0">
            <div className="flex justify-between">
              <div>
                <p className="font-medium">{item.package.title}</p>
                <p className="text-sm text-muted">
                  {formatDate(item.slot.date)} · {item.slot.startTime} · {item.passengers} passenger(s)
                </p>
              </div>
              <p className="font-medium">{formatINR(item.lineTotal.toString())}</p>
            </div>
          </div>
        ))}
        {booking.schoolItems.map((item) => (
          <div key={item.id} className="py-4 first:pt-0 last:pb-0">
            <div className="flex justify-between">
              <div>
                <p className="font-medium">{item.course.title}</p>
                <p className="text-sm text-muted">
                  {formatDate(item.batch.startDate)} – {formatDate(item.batch.endDate)} ·{" "}
                  {item.students} student(s)
                </p>
              </div>
              <p className="font-medium">{formatINR(item.lineTotal.toString())}</p>
            </div>
          </div>
        ))}
        {booking.hotelItems.map((item) => (
          <div key={item.id} className="py-4 first:pt-0 last:pb-0">
            <div className="flex justify-between">
              <div>
                <p className="font-medium">
                  {item.hotel.name} · {item.room.name}
                </p>
                <p className="text-sm text-muted">
                  {formatDate(item.checkIn)} – {formatDate(item.checkOut)} · {item.nights} night(s) ·{" "}
                  {item.rooms} room(s)
                </p>
              </div>
              <p className="font-medium">{formatINR(item.lineTotal.toString())}</p>
            </div>
          </div>
        ))}

        <div className="space-y-1 pt-4 text-sm">
          <div className="flex justify-between text-muted">
            <span>Subtotal</span>
            <span>{formatINR(booking.subtotal.toString())}</span>
          </div>
          <div className="flex justify-between pt-2 text-base font-bold">
            <span>Total</span>
            <span>{formatINR(booking.totalAmount.toString())}</span>
          </div>
        </div>
      </Card>

      {booking.payments.length > 0 && (
        <Card className="mt-4 p-6">
          <h2 className="text-sm font-semibold">Payments</h2>
          <div className="mt-3 space-y-2">
            {booking.payments.map((payment) => (
              <div key={payment.id} className="flex justify-between text-sm">
                <span className="text-muted">{payment.razorpayOrderId}</span>
                <Badge>{payment.status}</Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="mt-6">
        <BookingActions bookingId={booking.id} status={booking.status} />
      </div>
    </Container>
  );
}
