import { NextRequest } from "next/server";
import { requireRole } from "@/server/auth/guards";
import { courseService } from "@/server/modules/school/service";
import { courseUpdateSchema } from "@/server/modules/school/validation";
import { withErrorHandling, apiSuccess } from "@/server/lib/api-response";

export const GET = withErrorHandling(
  async (_request: Request, context: { params: Promise<{ id: string }> }) => {
    await requireRole("SUPER_ADMIN", "SCHOOL_MANAGER");
    const { id } = await context.params;
    const course = await courseService.getByIdForAdmin(id);
    return apiSuccess(course);
  },
);

export const PATCH = withErrorHandling(
  async (request: NextRequest, context: { params: Promise<{ id: string }> }) => {
    await requireRole("SUPER_ADMIN", "SCHOOL_MANAGER");
    const { id } = await context.params;
    const input = courseUpdateSchema.parse(await request.json());
    const course = await courseService.update(id, input);
    return apiSuccess(course);
  },
);

export const DELETE = withErrorHandling(
  async (_request: Request, context: { params: Promise<{ id: string }> }) => {
    await requireRole("SUPER_ADMIN", "SCHOOL_MANAGER");
    const { id } = await context.params;
    await courseService.remove(id);
    return apiSuccess({ deleted: true });
  },
);
