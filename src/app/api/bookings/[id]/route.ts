import { requireUser } from "@/server/auth/guards";
import { hasRole } from "@/server/auth/rbac";
import { bookingService } from "@/server/modules/booking/service";
import { withErrorHandling, apiSuccess } from "@/server/lib/api-response";

export const GET = withErrorHandling(
  async (_request: Request, context: { params: Promise<{ id: string }> }) => {
    const user = await requireUser();
    const { id } = await context.params;
    const isAdmin = hasRole(user.role, ["BOOKING_MANAGER", "FINANCE_MANAGER"]);
    const booking = await bookingService.getById(id, user.id, isAdmin);
    return apiSuccess(booking);
  },
);
