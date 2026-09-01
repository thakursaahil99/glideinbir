import { NextRequest } from "next/server";
import { requireRole } from "@/server/auth/guards";
import { amenityService } from "@/server/modules/hotel/service";
import { amenityUpdateSchema } from "@/server/modules/hotel/validation";
import { withErrorHandling, apiSuccess } from "@/server/lib/api-response";

export const PATCH = withErrorHandling(
  async (request: NextRequest, context: { params: Promise<{ id: string }> }) => {
    await requireRole("SUPER_ADMIN", "HOTEL_MANAGER");
    const { id } = await context.params;
    const input = amenityUpdateSchema.parse(await request.json());
    const amenity = await amenityService.update(id, input);
    return apiSuccess(amenity);
  },
);

export const DELETE = withErrorHandling(
  async (_request: Request, context: { params: Promise<{ id: string }> }) => {
    const user = await requireRole("SUPER_ADMIN", "HOTEL_MANAGER");
    const { id } = await context.params;
    await amenityService.remove(id, user.id);
    return apiSuccess({ deleted: true });
  },
);
