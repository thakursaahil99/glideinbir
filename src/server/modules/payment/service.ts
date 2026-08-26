import { prisma } from "@/server/db/prisma";
import { env } from "@/config/env";
import { ConflictError, ForbiddenError, NotFoundError, UnauthorizedError } from "@/server/lib/errors";
import { confirmBookingAvailability } from "@/server/modules/booking/availability";
import {
  createRazorpayOrder,
  captureRazorpayPayment,
  verifyPaymentSignature,
  refundRazorpayPayment,
  toPaise,
} from "./razorpay";

async function finalizePayment(
  paymentId: string,
  bookingId: string,
  amountRupees: number,
  razorpayPaymentId: string,
  razorpaySignature: string,
  options?: { skipCapture?: boolean },
) {
  const result = await confirmBookingAvailability(bookingId);

  if (result.confirmed) {
    if (!options?.skipCapture) {
      await captureRazorpayPayment(razorpayPaymentId, amountRupees);
    }
    await prisma.payment.update({
      where: { id: paymentId },
      data: { status: "SUCCESS", razorpayPaymentId, razorpaySignature },
    });
    // TODO(Phase 8): trigger a booking-confirmed email via the Notification service.
    return { confirmed: true as const };
  }

  // Availability lost the race — never captured, so the customer isn't
  // charged. Razorpay auto-releases an authorized-but-uncaptured payment.
  await prisma.payment.update({
    where: { id: paymentId },
    data: { status: "FAILED", razorpayPaymentId, razorpaySignature },
  });
  await prisma.booking.update({ where: { id: bookingId }, data: { status: "FAILED" } });
  return { confirmed: false as const, reason: result.reason };
}

export const paymentService = {
  async createOrderForBooking(bookingId: string, userId: string) {
    const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) throw new NotFoundError("Booking not found");
    if (booking.userId !== userId) throw new ForbiddenError();
    if (booking.status !== "PENDING") {
      throw new ConflictError("This booking is not awaiting payment");
    }

    if (env.PAYMENT_DEMO_MODE) {
      const demoOrderId = `demo_order_${Math.random().toString(36).slice(2, 10)}`;
      await prisma.payment.create({
        data: {
          bookingId: booking.id,
          razorpayOrderId: demoOrderId,
          amount: booking.totalAmount,
          status: "CREATED",
        },
      });
      return {
        orderId: demoOrderId,
        amount: toPaise(booking.totalAmount.toNumber()),
        currency: "INR",
        keyId: env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        demoMode: true as const,
      };
    }

    const order = await createRazorpayOrder(booking.totalAmount.toNumber(), booking.bookingNumber);
    await prisma.payment.create({
      data: {
        bookingId: booking.id,
        razorpayOrderId: order.id,
        amount: booking.totalAmount,
        status: "CREATED",
      },
    });

    return {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      demoMode: false as const,
    };
  },

  async confirmDemoPayment(bookingId: string, userId: string) {
    if (!env.PAYMENT_DEMO_MODE) throw new NotFoundError("Not found");

    const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) throw new NotFoundError("Booking not found");
    if (booking.userId !== userId) throw new ForbiddenError();
    if (booking.status !== "PENDING") {
      throw new ConflictError("This booking is not awaiting payment");
    }

    const payment = await prisma.payment.findFirst({
      where: { bookingId, status: "CREATED" },
      orderBy: { createdAt: "desc" },
    });
    if (!payment) throw new NotFoundError("No pending payment found for this booking");

    const demoPaymentId = `demo_pay_${Math.random().toString(36).slice(2, 10)}`;
    return finalizePayment(payment.id, bookingId, payment.amount.toNumber(), demoPaymentId, "demo", {
      skipCapture: true,
    });
  },

  async verifyPayment(input: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  }) {
    const payment = await prisma.payment.findUnique({
      where: { razorpayOrderId: input.razorpayOrderId },
    });
    if (!payment) throw new NotFoundError("Payment not found");

    // Idempotent: verify and the webhook race to finalize the same payment.
    if (payment.status === "SUCCESS") return { confirmed: true as const };

    const validSignature = verifyPaymentSignature(
      input.razorpayOrderId,
      input.razorpayPaymentId,
      input.razorpaySignature,
    );
    if (!validSignature) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: "FAILED",
          razorpayPaymentId: input.razorpayPaymentId,
          razorpaySignature: input.razorpaySignature,
        },
      });
      await prisma.booking.update({ where: { id: payment.bookingId }, data: { status: "FAILED" } });
      throw new UnauthorizedError("Payment signature verification failed");
    }

    return finalizePayment(
      payment.id,
      payment.bookingId,
      payment.amount.toNumber(),
      input.razorpayPaymentId,
      input.razorpaySignature,
    );
  },

  finalizePayment,

  async initiateRefund(paymentId: string, amount: number, reason?: string) {
    const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
    if (!payment) throw new NotFoundError("Payment not found");
    if (payment.status !== "SUCCESS" || !payment.razorpayPaymentId) {
      throw new ConflictError("Only a successfully captured payment can be refunded");
    }

    const refund = await prisma.refund.create({
      data: { paymentId: payment.id, amount, status: "INITIATED", reason },
    });

    const razorpayRefund = await refundRazorpayPayment(payment.razorpayPaymentId, amount);
    await prisma.refund.update({
      where: { id: refund.id },
      data: { razorpayRefundId: razorpayRefund.id },
    });
    await prisma.booking.update({
      where: { id: payment.bookingId },
      data: { status: "REFUND_PENDING" },
    });

    return refund;
  },
};
