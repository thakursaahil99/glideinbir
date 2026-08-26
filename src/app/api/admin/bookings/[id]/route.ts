import { requireRole } from "@/server/auth/guards";
import { bookingService } from "@/server/modules/booking/service";
import { withErrorHandling, apiSuccess } from "@/server/lib/api-response";

export const GET = withErrorHandling(
  async (_request: Request, context: { params: Promise<{ id: string }> }) => {
    const user = await requireRole("SUPER_ADMIN", "BOOKING_MANAGER", "FINANCE_MANAGER");
    const { id } = await context.params;
    const booking = await bookingService.getById(id, user.id, true);
    return apiSuccess(booking);
  },
);
