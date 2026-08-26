import { NextRequest } from "next/server";
import { requireUser } from "@/server/auth/guards";
import { bookingService } from "@/server/modules/booking/service";
import { createBookingSchema } from "@/server/modules/booking/validation";
import { withErrorHandling, apiSuccess } from "@/server/lib/api-response";

export const POST = withErrorHandling(async (request: NextRequest) => {
  const user = await requireUser();
  const input = createBookingSchema.parse(await request.json());
  const booking = await bookingService.create(input, user.id);
  return apiSuccess(booking, 201);
});
