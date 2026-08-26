import { requireRole } from "@/server/auth/guards";
import { bookingService } from "@/server/modules/booking/service";
import { withErrorHandling, apiSuccess } from "@/server/lib/api-response";

export const GET = withErrorHandling(async () => {
  await requireRole("SUPER_ADMIN", "BOOKING_MANAGER", "FINANCE_MANAGER");
  const bookings = await bookingService.listAdmin();
  return apiSuccess(bookings);
});
