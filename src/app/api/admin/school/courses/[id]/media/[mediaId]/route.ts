import { requireRole } from "@/server/auth/guards";
import { courseService } from "@/server/modules/school/service";
import { withErrorHandling, apiSuccess } from "@/server/lib/api-response";

export const DELETE = withErrorHandling(
  async (_request: Request, context: { params: Promise<{ id: string; mediaId: string }> }) => {
    await requireRole("SUPER_ADMIN", "SCHOOL_MANAGER");
    const { mediaId } = await context.params;
    await courseService.removeMedia(mediaId);
    return apiSuccess({ deleted: true });
  },
);
