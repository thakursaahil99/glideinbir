import type { Prisma } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import { logger } from "@/server/lib/logger";
import { paymentService } from "./service";

interface RazorpayWebhookBody {
  event: string;
  payload: {
    payment?: { entity: { id: string; order_id: string; amount: number } };
    refund?: { entity: { id: string; payment_id: string } };
  };
}

// Idempotent: WebhookEvent.razorpayEventId is unique, and every branch below
// checks the current Payment/Refund status before mutating anything, so a
// redelivered event (Razorpay's guarantee is at-least-once) is a safe no-op.
export async function handleWebhookEvent(eventId: string, body: RazorpayWebhookBody) {
  const existing = await prisma.webhookEvent.findUnique({ where: { razorpayEventId: eventId } });
  if (existing?.processedAt) return;

  const record =
    existing ??
    (await prisma.webhookEvent.create({
      data: {
        razorpayEventId: eventId,
        eventType: body.event,
        payload: body as unknown as Prisma.InputJsonValue,
      },
    }));

  switch (body.event) {
    case "payment.authorized": {
      const entity = body.payload.payment?.entity;
      if (entity) {
        const payment = await prisma.payment.findUnique({ where: { razorpayOrderId: entity.order_id } });
        if (payment && payment.status !== "SUCCESS") {
          // The webhook carries no checkout signature (that HMAC only
          // exists client-side, checked by /api/payments/verify) — its own
          // request signature, already checked by the route handler before
          // this runs, is what authorizes finalizing from here instead.
          await paymentService.finalizePayment(
            payment.id,
            payment.bookingId,
            payment.amount.toNumber(),
            entity.id,
            "",
          );
        }
      }
      break;
    }
    case "payment.failed": {
      const entity = body.payload.payment?.entity;
      if (entity) {
        const payment = await prisma.payment.findUnique({ where: { razorpayOrderId: entity.order_id } });
        if (payment && payment.status !== "SUCCESS") {
          await prisma.payment.update({
            where: { id: payment.id },
            data: { status: "FAILED", razorpayPaymentId: entity.id },
          });
          await prisma.booking.update({ where: { id: payment.bookingId }, data: { status: "FAILED" } });
        }
      }
      break;
    }
    case "refund.processed": {
      const entity = body.payload.refund?.entity;
      if (entity) {
        const refund = await prisma.refund.findUnique({ where: { razorpayRefundId: entity.id } });
        if (refund && refund.status !== "PROCESSED") {
          await prisma.refund.update({ where: { id: refund.id }, data: { status: "PROCESSED" } });
          const payment = await prisma.payment.findUnique({ where: { id: refund.paymentId } });
          if (payment) {
            await prisma.booking.update({ where: { id: payment.bookingId }, data: { status: "REFUNDED" } });
          }
        }
      }
      break;
    }
    case "refund.failed": {
      const entity = body.payload.refund?.entity;
      if (entity) {
        const refund = await prisma.refund.findUnique({ where: { razorpayRefundId: entity.id } });
        if (refund && refund.status !== "FAILED") {
          await prisma.refund.update({ where: { id: refund.id }, data: { status: "FAILED" } });
        }
      }
      break;
    }
    default:
      logger.info("Unhandled Razorpay webhook event", { eventType: body.event });
  }

  await prisma.webhookEvent.update({ where: { id: record.id }, data: { processedAt: new Date() } });
}
