import { requireRole } from "@/server/auth/guards";
import { hotelService } from "@/server/modules/hotel/service";
import { withErrorHandling, apiSuccess } from "@/server/lib/api-response";

export const DELETE = withErrorHandling(
  async (_request: Request, context: { params: Promise<{ id: string; mediaId: string }> }) => {
    await requireRole("SUPER_ADMIN", "HOTEL_MANAGER");
    const { mediaId } = await context.params;
    await hotelService.removeMedia(mediaId);
    return apiSuccess({ deleted: true });
  },
);
