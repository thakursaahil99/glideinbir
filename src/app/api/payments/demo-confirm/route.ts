import { NextRequest } from "next/server";
import { z } from "zod";
import { requireUser } from "@/server/auth/guards";
import { paymentService } from "@/server/modules/payment/service";
import { withErrorHandling, apiSuccess } from "@/server/lib/api-response";

const demoConfirmSchema = z.object({ bookingId: z.string().min(1) });

// Only does anything when PAYMENT_DEMO_MODE=true (paymentService throws
// NotFoundError otherwise) — lets the booking flow be tested end-to-end
// without a real Razorpay account.
export const POST = withErrorHandling(async (request: NextRequest) => {
  const user = await requireUser();
  const { bookingId } = demoConfirmSchema.parse(await request.json());
  const result = await paymentService.confirmDemoPayment(bookingId, user.id);
  return apiSuccess(result);
});
