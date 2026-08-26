import { NextRequest } from "next/server";
import { requireRole } from "@/server/auth/guards";
import { instructorService } from "@/server/modules/school/service";
import { instructorUpdateSchema } from "@/server/modules/school/validation";
import { withErrorHandling, apiSuccess } from "@/server/lib/api-response";

export const PATCH = withErrorHandling(
  async (request: NextRequest, context: { params: Promise<{ id: string }> }) => {
    await requireRole("SUPER_ADMIN", "SCHOOL_MANAGER");
    const { id } = await context.params;
    const input = instructorUpdateSchema.parse(await request.json());
    const instructor = await instructorService.update(id, input);
    return apiSuccess(instructor);
  },
);

export const DELETE = withErrorHandling(
  async (_request: Request, context: { params: Promise<{ id: string }> }) => {
    await requireRole("SUPER_ADMIN", "SCHOOL_MANAGER");
    const { id } = await context.params;
    await instructorService.remove(id);
    return apiSuccess({ deleted: true });
  },
);
