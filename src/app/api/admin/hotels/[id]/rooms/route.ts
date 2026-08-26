import { NextRequest } from "next/server";
import { requireRole } from "@/server/auth/guards";
import { roomService } from "@/server/modules/hotel/service";
import { roomInputSchema } from "@/server/modules/hotel/validation";
import { withErrorHandling, apiSuccess } from "@/server/lib/api-response";

export const GET = withErrorHandling(
  async (_request: Request, context: { params: Promise<{ id: string }> }) => {
    await requireRole("SUPER_ADMIN", "HOTEL_MANAGER");
    const { id } = await context.params;
    const rooms = await roomService.listForHotel(id);
    return apiSuccess(rooms);
  },
);

export const POST = withErrorHandling(
  async (request: NextRequest, context: { params: Promise<{ id: string }> }) => {
    await requireRole("SUPER_ADMIN", "HOTEL_MANAGER");
    const { id } = await context.params;
    const input = roomInputSchema.parse(await request.json());
    const room = await roomService.create(id, input);
    return apiSuccess(room, 201);
  },
);
