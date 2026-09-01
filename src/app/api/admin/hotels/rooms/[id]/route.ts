import { NextRequest } from "next/server";
import { requireRole } from "@/server/auth/guards";
import { roomService } from "@/server/modules/hotel/service";
import { roomUpdateSchema } from "@/server/modules/hotel/validation";
import { withErrorHandling, apiSuccess } from "@/server/lib/api-response";

export const GET = withErrorHandling(
  async (_request: Request, context: { params: Promise<{ id: string }> }) => {
    await requireRole("SUPER_ADMIN", "HOTEL_MANAGER");
    const { id } = await context.params;
    const room = await roomService.getByIdForAdmin(id);
    return apiSuccess(room);
  },
);

export const PATCH = withErrorHandling(
  async (request: NextRequest, context: { params: Promise<{ id: string }> }) => {
    await requireRole("SUPER_ADMIN", "HOTEL_MANAGER");
    const { id } = await context.params;
    const input = roomUpdateSchema.parse(await request.json());
    const room = await roomService.update(id, input);
    return apiSuccess(room);
  },
);

export const DELETE = withErrorHandling(
  async (_request: Request, context: { params: Promise<{ id: string }> }) => {
    const user = await requireRole("SUPER_ADMIN", "HOTEL_MANAGER");
    const { id } = await context.params;
    await roomService.remove(id, user.id);
    return apiSuccess({ deleted: true });
  },
);
