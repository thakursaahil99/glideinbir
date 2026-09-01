import { NextRequest } from "next/server";
import { requireRole } from "@/server/auth/guards";
import { hotelService } from "@/server/modules/hotel/service";
import { hotelUpdateSchema } from "@/server/modules/hotel/validation";
import { withErrorHandling, apiSuccess } from "@/server/lib/api-response";

export const GET = withErrorHandling(
  async (_request: Request, context: { params: Promise<{ id: string }> }) => {
    await requireRole("SUPER_ADMIN", "HOTEL_MANAGER");
    const { id } = await context.params;
    const hotel = await hotelService.getByIdForAdmin(id);
    return apiSuccess(hotel);
  },
);

export const PATCH = withErrorHandling(
  async (request: NextRequest, context: { params: Promise<{ id: string }> }) => {
    await requireRole("SUPER_ADMIN", "HOTEL_MANAGER");
    const { id } = await context.params;
    const input = hotelUpdateSchema.parse(await request.json());
    const hotel = await hotelService.update(id, input);
    return apiSuccess(hotel);
  },
);

export const DELETE = withErrorHandling(
  async (_request: Request, context: { params: Promise<{ id: string }> }) => {
    const user = await requireRole("SUPER_ADMIN", "HOTEL_MANAGER");
    const { id } = await context.params;
    await hotelService.remove(id, user.id);
    return apiSuccess({ deleted: true });
  },
);
