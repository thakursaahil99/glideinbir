import { NextRequest } from "next/server";
import { requireRole } from "@/server/auth/guards";
import { categoryService } from "@/server/modules/adventure/service";
import { categoryUpdateSchema } from "@/server/modules/adventure/validation";
import { withErrorHandling, apiSuccess } from "@/server/lib/api-response";

export const PATCH = withErrorHandling(
  async (request: NextRequest, context: { params: Promise<{ id: string }> }) => {
    await requireRole("SUPER_ADMIN", "ADVENTURE_MANAGER");
    const { id } = await context.params;
    const input = categoryUpdateSchema.parse(await request.json());
    const category = await categoryService.update(id, input);
    return apiSuccess(category);
  },
);

export const DELETE = withErrorHandling(
  async (_request: Request, context: { params: Promise<{ id: string }> }) => {
    await requireRole("SUPER_ADMIN", "ADVENTURE_MANAGER");
    const { id } = await context.params;
    await categoryService.remove(id);
    return apiSuccess({ deleted: true });
  },
);
