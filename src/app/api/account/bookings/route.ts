import { requireUser } from "@/server/auth/guards";
import { bookingService } from "@/server/modules/booking/service";
import { withErrorHandling, apiSuccess } from "@/server/lib/api-response";

export const GET = withErrorHandling(async () => {
  const user = await requireUser();
  const bookings = await bookingService.listForUser(user.id);
  return apiSuccess(bookings);
});
