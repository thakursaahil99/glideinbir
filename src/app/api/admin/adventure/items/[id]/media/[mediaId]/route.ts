import { requireRole } from "@/server/auth/guards";
import { itemService } from "@/server/modules/adventure/service";
import { withErrorHandling, apiSuccess } from "@/server/lib/api-response";

export const DELETE = withErrorHandling(
  async (_request: Request, context: { params: Promise<{ id: string; mediaId: string }> }) => {
    await requireRole("SUPER_ADMIN", "ADVENTURE_MANAGER");
    const { mediaId } = await context.params;
    await itemService.removeMedia(mediaId);
    return apiSuccess({ deleted: true });
  },
);
