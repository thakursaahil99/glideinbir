import Image from "next/image";
import { notFound } from "next/navigation";
import { requireUserForPage } from "@/server/auth/guards";
import { hasRole } from "@/server/auth/rbac";
import { bookingService } from "@/server/modules/booking/service";
import { Card, Container, Badge } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/button";
import { PaymentPanel } from "@/components/site/payment-panel";
import { formatDate, formatINR } from "@/lib/format";
import { ParticleField } from "@/components/effects/particle-field";
import { HeroSceneLazy } from "@/components/effects/hero-scene-lazy";
import { ScrollReveal } from "@/components/effects/scroll-reveal";
import {
  Wind,
  GraduationCap,
  Hotel,
  Tent,
  Bus,
  CircleCheck,
  Clock,
  XCircle,
  ShieldCheck,
  Receipt,
  type LucideIcon,
} from "lucide-react";

const STATUS: Record<string, { label: string; icon: LucideIcon }> = {
  PENDING: { label: "Awaiting payment", icon: Clock },
  CONFIRMED: { label: "Confirmed", icon: CircleCheck },
  CANCELLED: { label: "Cancelled", icon: XCircle },
  COMPLETED: { label: "Completed", icon: CircleCheck },
  REFUND_PENDING: { label: "Refund pending", icon: Clock },
  REFUNDED: { label: "Refunded", icon: XCircle },
  FAILED: { label: "Payment failed", icon: XCircle },
};

type LineItem = {
  key: string;
  icon: LucideIcon;
  category: string;
  image: string;
  title: string;
  description?: string;
  meta: string;
  amount: string;
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

  const status = STATUS[booking.status] ?? { label: booking.status, icon: Clock };
  const StatusIcon = status.icon;

  const lineItems: LineItem[] = [
    ...booking.paraglidingItems.map((item) => ({
      key: item.id,
      icon: Wind,
      category: "Paragliding",
      image: item.package.media[0]?.url ?? "/placeholder.svg",
      title: item.package.title,
      description: item.package.shortDescription ?? item.package.description,
      meta: `${formatDate(item.slot.date)} · ${item.slot.startTime} · ${item.passengers} passenger(s)`,
      amount: formatINR(item.lineTotal.toString()),
    })),
    ...booking.schoolItems.map((item) => ({
      key: item.id,
      icon: GraduationCap,
      category: "School",
      image: item.course.media[0]?.url ?? "/placeholder.svg",
      title: item.course.title,
      description: item.course.description,
      meta: `${formatDate(item.batch.startDate)} – ${formatDate(item.batch.endDate)} · ${item.students} student(s)`,
      amount: formatINR(item.lineTotal.toString()),
    })),
    ...booking.hotelItems.map((item) => ({
      key: item.id,
      icon: Hotel,
      category: "Hotel",
      image: item.room.media[0]?.url ?? item.hotel.media[0]?.url ?? "/placeholder.svg",
      title: `${item.hotel.name} · ${item.room.name}`,
      description: item.hotel.description,
      meta: `${formatDate(item.checkIn)} – ${formatDate(item.checkOut)} · ${item.nights} night(s) · ${item.rooms} room(s)`,
      amount: formatINR(item.lineTotal.toString()),
    })),
    ...booking.adventureItems.map((item) => ({
      key: item.id,
      icon: Tent,
      category: "Adventure",
      image: item.item.media[0]?.url ?? "/placeholder.svg",
      title: item.item.title,
      description: item.item.shortDescription ?? item.item.description,
      meta: `${formatDate(item.slot.date)} · ${item.quantity} unit(s)`,
      amount: formatINR(item.lineTotal.toString()),
    })),
    ...booking.travelItems.map((item) => ({
      key: item.id,
      icon: Bus,
      category: "Travel",
      image: item.route.media[0]?.url ?? "/placeholder.svg",
      title: item.route.title,
      description: item.route.description,
      meta: `${formatDate(item.slot.date)} · ${item.slot.departureTime} · ${item.passengers} passenger(s)`,
      amount: formatINR(item.lineTotal.toString()),
    })),
  ];

  const taxableAmount = Number(booking.subtotal) - Number(booking.discountAmount);
  const gstPercent =
    taxableAmount > 0 ? Math.round((Number(booking.taxAmount) / taxableAmount) * 1000) / 10 : 0;

  return (
    <>
      <section className="relative overflow-hidden bg-ink py-20 text-white md:py-28">
        <Image
          src="https://images.unsplash.com/photo-1722253991955-7359db2e7e5e?q=80&w=1920&h=1080&auto=format&fit=crop"
          alt=""
          fill
          priority
          className="object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/85 to-ink/50" />
        <ParticleField variant="dust" density={30} />
        <div className="pointer-events-none absolute -right-10 bottom-0 hidden h-72 w-72 lg:block">
          <HeroSceneLazy variant="icosahedron" />
        </div>

        <Container className="relative z-10">
          <p className="text-sm text-white/60">Booking {booking.bookingNumber}</p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight md:text-5xl">Your booking</h1>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium">
              <StatusIcon className="h-4 w-4" strokeWidth={2.5} />
              {status.label}
            </span>
            <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm text-white/80">
              <Clock className="h-4 w-4" strokeWidth={2.5} />
              Booked {formatDate(booking.createdAt)}
            </span>
          </div>
        </Container>
      </section>

      <Container className="py-14 md:py-16">
        <div className="grid gap-10 lg:grid-cols-[1fr_380px] lg:items-start">
          <ScrollReveal>
            <h2 className="text-lg font-semibold">Booking details</h2>
            <div className="mt-4 space-y-4">
              {lineItems.map(({ key, icon: Icon, category, image, title, description, meta, amount }) => (
                <Card key={key} className="flex gap-4 p-4 md:p-5">
                  <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl md:h-28 md:w-28">
                    <Image src={image} alt="" fill className="object-cover" />
                  </div>
                  <div className="flex flex-1 flex-col justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge className="gap-1">
                          <Icon className="h-3 w-3" strokeWidth={2.5} />
                          {category}
                        </Badge>
                      </div>
                      <p className="mt-1.5 font-semibold">{title}</p>
                      {description && (
                        <p className="mt-0.5 line-clamp-1 text-sm text-muted">{description}</p>
                      )}
                      <p className="mt-1 text-sm text-muted">{meta}</p>
                    </div>
                  </div>
                  <p className="shrink-0 whitespace-nowrap self-start font-semibold">{amount}</p>
                </Card>
              ))}
            </div>
          </ScrollReveal>

          <ScrollReveal direction="left">
            <Card className="p-6">
              <div className="flex items-center gap-2 text-sm font-semibold text-muted">
                <Receipt className="h-4 w-4" />
                Payment summary
              </div>

              <div className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
                <div className="flex justify-between text-muted">
                  <span>Subtotal</span>
                  <span>{formatINR(booking.subtotal.toString())}</span>
                </div>
                {Number(booking.discountAmount) > 0 && (
                  <div className="flex justify-between text-muted">
                    <span>Discount {booking.coupon ? `(${booking.coupon.code})` : ""}</span>
                    <span>-{formatINR(booking.discountAmount.toString())}</span>
                  </div>
                )}
                <div className="flex justify-between text-muted">
                  <span>GST {gstPercent > 0 ? `(${gstPercent}%)` : ""}</span>
                  <span>{formatINR(booking.taxAmount.toString())}</span>
                </div>
              </div>

              <div className="mt-3 flex items-baseline justify-between border-t border-border pt-4">
                <span className="text-sm text-muted">Total</span>
                <span className="text-2xl font-bold">{formatINR(booking.totalAmount.toString())}</span>
              </div>

              <div className="mt-6">
                {booking.status === "PENDING" && (
                  <>
                    <PaymentPanel
                      bookingId={booking.id}
                      customer={{
                        name: booking.customerName,
                        email: booking.customerEmail,
                        phone: booking.customerPhone,
                      }}
                    />
                    <p className="mt-4 flex items-center justify-center gap-2 text-center text-xs text-muted">
                      <ShieldCheck className="h-4 w-4 shrink-0 text-brand" />
                      Razorpay-secured — you&apos;re only charged once confirmed.
                    </p>
                  </>
                )}
                {booking.status === "CONFIRMED" && (
                  <div className="text-center">
                    <CircleCheck className="mx-auto h-8 w-8 text-emerald-600" />
                    <p className="mt-3 font-medium">Your booking is confirmed!</p>
                    <LinkButton href="/account/bookings" variant="ghost" className="mt-4">
                      View my bookings
                    </LinkButton>
                  </div>
                )}
                {(booking.status === "FAILED" || booking.status === "CANCELLED") && (
                  <p className="text-center text-sm text-muted">
                    This booking is {status.label.toLowerCase()}.
                  </p>
                )}
              </div>
            </Card>
          </ScrollReveal>
        </div>
      </Container>
    </>
  );
}
