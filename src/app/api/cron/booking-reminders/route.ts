import { NextRequest } from "next/server";
import { prisma } from "@/server/db/prisma";
import { env } from "@/config/env";
import { withErrorHandling, apiSuccess } from "@/server/lib/api-response";
import { UnauthorizedError } from "@/server/lib/errors";
import { notificationService } from "@/server/modules/notification/service";
import { bookingReminderEmail } from "@/server/modules/notification/templates";

function startOfDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

// Runs once a day (see vercel.json) and emails every CONFIRMED booking with
// a paragliding slot / batch start / hotel check-in / adventure slot /
// travel departure scheduled for tomorrow. Idempotency has no dedicated
// column — it checks whether a BOOKING_REMINDER Notification already went
// to that customer today before sending, so a re-run (or Vercel retrying a
// slow invocation) can't double-send.
export const GET = withErrorHandling(async (request: NextRequest) => {
  // Vercel Cron sends `Authorization: Bearer $CRON_SECRET` automatically
  // once CRON_SECRET is set on the project — see env.ts.
  if (!env.CRON_SECRET || request.headers.get("authorization") !== `Bearer ${env.CRON_SECRET}`) {
    throw new UnauthorizedError();
  }

  const today = startOfDay(new Date());
  const tomorrow = new Date(today);
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);

  const [pgItems, schoolItems, hotelItems, adventureItems, travelItems] = await Promise.all([
    prisma.bookingItemParagliding.findMany({
      where: { slot: { date: tomorrow }, booking: { status: "CONFIRMED" } },
      select: { bookingId: true },
    }),
    prisma.bookingItemSchool.findMany({
      where: { batch: { startDate: tomorrow }, booking: { status: "CONFIRMED" } },
      select: { bookingId: true },
    }),
    prisma.bookingItemHotel.findMany({
      where: { checkIn: tomorrow, booking: { status: "CONFIRMED" } },
      select: { bookingId: true },
    }),
    prisma.bookingItemAdventure.findMany({
      where: { slot: { date: tomorrow }, booking: { status: "CONFIRMED" } },
      select: { bookingId: true },
    }),
    prisma.bookingItemTravel.findMany({
      where: { slot: { date: tomorrow }, booking: { status: "CONFIRMED" } },
      select: { bookingId: true },
    }),
  ]);

  const bookingIds = Array.from(
    new Set(
      [...pgItems, ...schoolItems, ...hotelItems, ...adventureItems, ...travelItems].map((i) => i.bookingId),
    ),
  );

  if (bookingIds.length === 0) {
    return apiSuccess({ checked: 0, sent: 0 });
  }

  const bookings = await prisma.booking.findMany({ where: { id: { in: bookingIds } } });

  let sent = 0;
  for (const booking of bookings) {
    const alreadySentToday = await prisma.notification.findFirst({
      where: { type: "BOOKING_REMINDER", recipient: booking.customerEmail, createdAt: { gte: today } },
    });
    if (alreadySentToday) continue;

    const { subject, html } = bookingReminderEmail({
      name: booking.customerName,
      bookingNumber: booking.bookingNumber,
      bookingUrl: `${env.NEXT_PUBLIC_SITE_URL}/booking/${booking.id}`,
    });
    await notificationService.sendEmail({
      userId: booking.userId,
      type: "BOOKING_REMINDER",
      recipient: booking.customerEmail,
      subject,
      html,
    });
    sent += 1;
  }

  return apiSuccess({ checked: bookings.length, sent });
});
