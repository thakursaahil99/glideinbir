import { requireRole } from "@/server/auth/guards";
import { routeService } from "@/server/modules/travel/service";
import { withErrorHandling, apiSuccess } from "@/server/lib/api-response";

export const DELETE = withErrorHandling(
  async (_request: Request, context: { params: Promise<{ id: string; mediaId: string }> }) => {
    await requireRole("SUPER_ADMIN", "TRAVEL_MANAGER");
    const { mediaId } = await context.params;
    await routeService.removeMedia(mediaId);
    return apiSuccess({ deleted: true });
  },
);
