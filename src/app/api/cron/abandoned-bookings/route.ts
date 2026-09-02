import { NextRequest } from "next/server";
import { prisma } from "@/server/db/prisma";
import { env } from "@/config/env";
import { withErrorHandling, apiSuccess } from "@/server/lib/api-response";
import { UnauthorizedError } from "@/server/lib/errors";
import { notificationService } from "@/server/modules/notification/service";
import { abandonedBookingEmail } from "@/server/modules/notification/templates";

const GRACE_PERIOD_MS = 60 * 60 * 1000; // don't nag someone still mid-checkout
const CUTOFF_MS = 48 * 60 * 60 * 1000; // stop after 2 days — genuinely abandoned by then

// Runs once a day (see vercel.json). A booking left PENDING (created, but
// never paid) between 1 and 48 hours ago gets a nudge email — same
// same-day-Notification idempotency check as booking-reminders, so a
// re-run can't double-send. In practice this means one, occasionally two,
// nudges before the 48h cutoff drops it from consideration entirely.
export const GET = withErrorHandling(async (request: NextRequest) => {
  if (!env.CRON_SECRET || request.headers.get("authorization") !== `Bearer ${env.CRON_SECRET}`) {
    throw new UnauthorizedError();
  }

  const now = Date.now();
  const bookings = await prisma.booking.findMany({
    where: {
      status: "PENDING",
      createdAt: { gte: new Date(now - CUTOFF_MS), lte: new Date(now - GRACE_PERIOD_MS) },
    },
  });

  let sent = 0;
  for (const booking of bookings) {
    const alreadySentToday = await prisma.notification.findFirst({
      where: {
        type: "ABANDONED_BOOKING",
        recipient: booking.customerEmail,
        createdAt: { gte: new Date(now - 24 * 60 * 60 * 1000) },
      },
    });
    if (alreadySentToday) continue;

    const { subject, html } = abandonedBookingEmail({
      name: booking.customerName,
      bookingNumber: booking.bookingNumber,
      bookingUrl: `${env.NEXT_PUBLIC_SITE_URL}/booking/${booking.id}`,
    });
    await notificationService.sendEmail({
      userId: booking.userId,
      type: "ABANDONED_BOOKING",
      recipient: booking.customerEmail,
      subject,
      html,
    });
    sent += 1;
  }

  return apiSuccess({ checked: bookings.length, sent });
});
