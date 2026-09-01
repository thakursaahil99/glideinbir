import { requireRole } from "@/server/auth/guards";
import { withErrorHandling, apiSuccess } from "@/server/lib/api-response";
import { restoreAuditLog } from "@/server/lib/audit";

export const POST = withErrorHandling(
  async (_request: Request, context: { params: Promise<{ id: string }> }) => {
    const user = await requireRole("SUPER_ADMIN");
    const { id } = await context.params;
    const result = await restoreAuditLog(id, user.id);
    return apiSuccess(result);
  },
);
