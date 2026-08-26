import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/server/modules/payment/razorpay";
import { handleWebhookEvent } from "@/server/modules/payment/webhook-handlers";
import { logger } from "@/server/lib/logger";

// Not wrapped in withErrorHandling: Razorpay expects a plain 2xx/4xx, and we
// must read the body as raw text (not JSON) before anything else, since the
// signature is an HMAC over the exact raw bytes received.
export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-razorpay-signature");
  const eventId = request.headers.get("x-razorpay-event-id");

  if (!signature || !eventId || !verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ success: false }, { status: 400 });
  }

  try {
    const body = JSON.parse(rawBody);
    await handleWebhookEvent(eventId, body);
    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error("Failed to process Razorpay webhook", {
      message: error instanceof Error ? error.message : String(error),
    });
    // 200 so Razorpay doesn't hammer retries for a bug on our side while we
    // investigate — /api/payments/verify is the primary confirmation path;
    // this is the idempotent backstop (ARCHITECTURE.md section 9).
    return NextResponse.json({ success: false }, { status: 200 });
  }
}
