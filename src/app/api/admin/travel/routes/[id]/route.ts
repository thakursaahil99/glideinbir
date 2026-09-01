import { NextRequest } from "next/server";
import { requireRole } from "@/server/auth/guards";
import { routeService } from "@/server/modules/travel/service";
import { routeUpdateSchema } from "@/server/modules/travel/validation";
import { withErrorHandling, apiSuccess } from "@/server/lib/api-response";

export const GET = withErrorHandling(
  async (_request: Request, context: { params: Promise<{ id: string }> }) => {
    await requireRole("SUPER_ADMIN", "TRAVEL_MANAGER");
    const { id } = await context.params;
    const route = await routeService.getByIdForAdmin(id);
    return apiSuccess(route);
  },
);

export const PATCH = withErrorHandling(
  async (request: NextRequest, context: { params: Promise<{ id: string }> }) => {
    await requireRole("SUPER_ADMIN", "TRAVEL_MANAGER");
    const { id } = await context.params;
    const input = routeUpdateSchema.parse(await request.json());
    const route = await routeService.update(id, input);
    return apiSuccess(route);
  },
);

export const DELETE = withErrorHandling(
  async (_request: Request, context: { params: Promise<{ id: string }> }) => {
    const user = await requireRole("SUPER_ADMIN", "TRAVEL_MANAGER");
    const { id } = await context.params;
    await routeService.remove(id, user.id);
    return apiSuccess({ deleted: true });
  },
);
