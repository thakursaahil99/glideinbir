import { NextRequest } from "next/server";
import { requireRole } from "@/server/auth/guards";
import { itemService } from "@/server/modules/adventure/service";
import { itemUpdateSchema } from "@/server/modules/adventure/validation";
import { withErrorHandling, apiSuccess } from "@/server/lib/api-response";

export const GET = withErrorHandling(
  async (_request: Request, context: { params: Promise<{ id: string }> }) => {
    await requireRole("SUPER_ADMIN", "ADVENTURE_MANAGER");
    const { id } = await context.params;
    const item = await itemService.getByIdForAdmin(id);
    return apiSuccess(item);
  },
);

export const PATCH = withErrorHandling(
  async (request: NextRequest, context: { params: Promise<{ id: string }> }) => {
    await requireRole("SUPER_ADMIN", "ADVENTURE_MANAGER");
    const { id } = await context.params;
    const input = itemUpdateSchema.parse(await request.json());
    const item = await itemService.update(id, input);
    return apiSuccess(item);
  },
);

export const DELETE = withErrorHandling(
  async (_request: Request, context: { params: Promise<{ id: string }> }) => {
    const user = await requireRole("SUPER_ADMIN", "ADVENTURE_MANAGER");
    const { id } = await context.params;
    await itemService.remove(id, user.id);
    return apiSuccess({ deleted: true });
  },
);
