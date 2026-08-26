import { requireRole } from "@/server/auth/guards";
import { packageService } from "@/server/modules/paragliding/service";
import { withErrorHandling, apiSuccess } from "@/server/lib/api-response";

export const DELETE = withErrorHandling(
  async (_request: Request, context: { params: Promise<{ id: string; mediaId: string }> }) => {
    await requireRole("SUPER_ADMIN", "PARAGLIDING_MANAGER");
    const { mediaId } = await context.params;
    await packageService.removeMedia(mediaId);
    return apiSuccess({ deleted: true });
  },
);
