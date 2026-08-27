import Razorpay from "razorpay";
import { createHmac, timingSafeEqual } from "node:crypto";
import { env } from "@/config/env";

export const razorpay = new Razorpay({
  key_id: env.RAZORPAY_KEY_ID,
  key_secret: env.RAZORPAY_KEY_SECRET,
});

export function toPaise(amount: number): number {
  return Math.round(amount * 100);
}

// Manual capture: Razorpay authorizes the charge but does not take the
// customer's money until captureRazorpayPayment() is called. That call only
// happens after the availability-locking transaction confirms the booking,
// so a customer is never charged for a seat/room that turned out to be
// unavailable (ARCHITECTURE.md section 8 step 5c) — an authorized-but-
// never-captured payment auto-releases on Razorpay's side.
export async function createRazorpayOrder(amountRupees: number, receipt: string) {
  return razorpay.orders.create({
    amount: toPaise(amountRupees),
    currency: "INR",
    receipt,
    payment: {
      capture: "manual",
      // Required by Razorpay whenever capture is "manual" — how long an
      // authorized-but-uncaptured payment is held before Razorpay
      // auto-refunds it. Our own capture normally happens within seconds
      // (right after /api/payments/verify), so this is just a generous
      // safety window, not the expected wait — max allowed value (5 days).
      // automatic_expiry_period is required by the SDK's TS type but only
      // actually used when capture is "automatic" (per Razorpay's own docs
      // comment on the field) — harmless placeholder here.
      capture_options: {
        manual_expiry_period: 7200,
        automatic_expiry_period: 60,
        refund_speed: "normal",
      },
    },
  });
}

export async function captureRazorpayPayment(razorpayPaymentId: string, amountRupees: number) {
  return razorpay.payments.capture(razorpayPaymentId, toPaise(amountRupees), "INR");
}

// HMAC-SHA256(order_id + "|" + payment_id, key_secret), per Razorpay's
// documented checkout signature scheme (ARCHITECTURE.md section 9). The
// razorpay-node SDK doesn't expose this verifier on its public export
// (only validateWebhookSignature is), so it's computed directly here.
export function verifyPaymentSignature(orderId: string, paymentId: string, signature: string): boolean {
  const expected = createHmac("sha256", env.RAZORPAY_KEY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  const expectedBuf = Buffer.from(expected, "hex");
  const actualBuf = Buffer.from(signature, "hex");
  if (expectedBuf.length !== actualBuf.length) return false;
  return timingSafeEqual(expectedBuf, actualBuf);
}

export function verifyWebhookSignature(rawBody: string, signature: string): boolean {
  return Razorpay.validateWebhookSignature(rawBody, signature, env.RAZORPAY_WEBHOOK_SECRET);
}

export async function refundRazorpayPayment(razorpayPaymentId: string, amountRupees: number) {
  return razorpay.payments.refund(razorpayPaymentId, { amount: toPaise(amountRupees) });
}
