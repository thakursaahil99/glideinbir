import { requireRole } from "@/server/auth/guards";
import { bookingService } from "@/server/modules/booking/service";
import { withErrorHandling, apiSuccess } from "@/server/lib/api-response";

export const POST = withErrorHandling(
  async (_request: Request, context: { params: Promise<{ id: string }> }) => {
    await requireRole("SUPER_ADMIN", "BOOKING_MANAGER");
    const { id } = await context.params;
    const booking = await bookingService.complete(id);
    return apiSuccess(booking);
  },
);
