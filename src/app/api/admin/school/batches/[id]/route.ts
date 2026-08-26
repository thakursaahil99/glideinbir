import { NextRequest } from "next/server";
import { requireRole } from "@/server/auth/guards";
import { batchService } from "@/server/modules/school/service";
import { batchUpdateSchema } from "@/server/modules/school/validation";
import { withErrorHandling, apiSuccess } from "@/server/lib/api-response";

export const PATCH = withErrorHandling(
  async (request: NextRequest, context: { params: Promise<{ id: string }> }) => {
    await requireRole("SUPER_ADMIN", "SCHOOL_MANAGER");
    const { id } = await context.params;
    const input = batchUpdateSchema.parse(await request.json());
    const batch = await batchService.update(id, input);
    return apiSuccess(batch);
  },
);

export const DELETE = withErrorHandling(
  async (_request: Request, context: { params: Promise<{ id: string }> }) => {
    await requireRole("SUPER_ADMIN", "SCHOOL_MANAGER");
    const { id } = await context.params;
    await batchService.remove(id);
    return apiSuccess({ deleted: true });
  },
);
