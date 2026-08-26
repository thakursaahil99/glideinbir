import { NextRequest } from "next/server";
import { z } from "zod";
import { requireUser } from "@/server/auth/guards";
import { paymentService } from "@/server/modules/payment/service";
import { withErrorHandling, apiSuccess } from "@/server/lib/api-response";

const verifySchema = z.object({
  razorpayOrderId: z.string().min(1),
  razorpayPaymentId: z.string().min(1),
  razorpaySignature: z.string().min(1),
});

export const POST = withErrorHandling(async (request: NextRequest) => {
  await requireUser();
  const input = verifySchema.parse(await request.json());
  const result = await paymentService.verifyPayment(input);
  return apiSuccess(result);
});
