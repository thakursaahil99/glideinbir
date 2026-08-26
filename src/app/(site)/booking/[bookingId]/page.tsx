import { notFound } from "next/navigation";
import { requireUserForPage } from "@/server/auth/guards";
import { hasRole } from "@/server/auth/rbac";
import { bookingService } from "@/server/modules/booking/service";
import { Card, Container, Badge } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/button";
import { PaymentPanel } from "@/components/site/payment-panel";
import { formatDate, formatINR } from "@/lib/format";

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Awaiting payment",
  CONFIRMED: "Confirmed",
  CANCELLED: "Cancelled",
  COMPLETED: "Completed",
  REFUND_PENDING: "Refund pending",
  REFUNDED: "Refunded",
  FAILED: "Payment failed",
};

export default async function BookingPage({
  params,
}: {
  params: Promise<{ bookingId: string }>;
}) {
  const { bookingId } = await params;
  const user = await requireUserForPage(`/booking/${bookingId}`);

  const isAdmin = hasRole(user.role, ["BOOKING_MANAGER", "FINANCE_MANAGER"]);
  const booking = await bookingService.getById(bookingId, user.id, isAdmin).catch(() => null);
  if (!booking) notFound();

  return (
    <Container className="max-w-2xl py-16">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted">Booking {booking.bookingNumber}</p>
          <h1 className="text-2xl font-bold tracking-tight">Your booking</h1>
        </div>
        <Badge>{STATUS_LABEL[booking.status] ?? booking.status}</Badge>
      </div>

      <Card className="mt-8 divide-y divide-border p-6">
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
          {Number(booking.discountAmount) > 0 && (
            <div className="flex justify-between text-muted">
              <span>Discount</span>
              <span>-{formatINR(booking.discountAmount.toString())}</span>
            </div>
          )}
          {Number(booking.taxAmount) > 0 && (
            <div className="flex justify-between text-muted">
              <span>Tax</span>
              <span>{formatINR(booking.taxAmount.toString())}</span>
            </div>
          )}
          <div className="flex justify-between pt-2 text-base font-bold">
            <span>Total</span>
            <span>{formatINR(booking.totalAmount.toString())}</span>
          </div>
        </div>
      </Card>

      <div className="mt-8">
        {booking.status === "PENDING" && (
          <PaymentPanel
            bookingId={booking.id}
            customer={{
              name: booking.customerName,
              email: booking.customerEmail,
              phone: booking.customerPhone,
            }}
          />
        )}
        {booking.status === "CONFIRMED" && (
          <div className="rounded-lg bg-surface p-4 text-center">
            <p className="font-medium">Your booking is confirmed 🎉</p>
            <LinkButton href="/account/bookings" variant="ghost" className="mt-4">
              View my bookings
            </LinkButton>
          </div>
        )}
        {(booking.status === "FAILED" || booking.status === "CANCELLED") && (
          <div className="rounded-lg bg-surface p-4 text-center text-sm text-muted">
            This booking is {STATUS_LABEL[booking.status]?.toLowerCase()}.
          </div>
        )}
      </div>
    </Container>
  );
}
