import { NextRequest } from "next/server";
import { requireRole } from "@/server/auth/guards";
import { slotService } from "@/server/modules/travel/service";
import { slotUpdateSchema } from "@/server/modules/travel/validation";
import { withErrorHandling, apiSuccess } from "@/server/lib/api-response";

export const PATCH = withErrorHandling(
  async (request: NextRequest, context: { params: Promise<{ id: string }> }) => {
    await requireRole("SUPER_ADMIN", "TRAVEL_MANAGER");
    const { id } = await context.params;
    const input = slotUpdateSchema.parse(await request.json());
    const slot = await slotService.update(id, input);
    return apiSuccess(slot);
  },
);

export const DELETE = withErrorHandling(
  async (_request: Request, context: { params: Promise<{ id: string }> }) => {
    await requireRole("SUPER_ADMIN", "TRAVEL_MANAGER");
    const { id } = await context.params;
    await slotService.remove(id);
    return apiSuccess({ deleted: true });
  },
);
