import { NextRequest } from "next/server";
import { z } from "zod";
import { requireUser } from "@/server/auth/guards";
import { paymentService } from "@/server/modules/payment/service";
import { withErrorHandling, apiSuccess } from "@/server/lib/api-response";

const createOrderSchema = z.object({
  bookingId: z.string().min(1),
  option: z.enum(["full", "token"]).default("full"),
});

export const POST = withErrorHandling(async (request: NextRequest) => {
  const user = await requireUser();
  const { bookingId, option } = createOrderSchema.parse(await request.json());
  const order = await paymentService.createOrderForBooking(bookingId, user.id, option);
  return apiSuccess(order, 201);
});
