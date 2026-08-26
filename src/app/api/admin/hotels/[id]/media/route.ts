import { NextRequest } from "next/server";
import { requireRole } from "@/server/auth/guards";
import { hotelService } from "@/server/modules/hotel/service";
import { hotelMediaInputSchema } from "@/server/modules/hotel/validation";
import { withErrorHandling, apiSuccess } from "@/server/lib/api-response";

export const POST = withErrorHandling(
  async (request: NextRequest, context: { params: Promise<{ id: string }> }) => {
    await requireRole("SUPER_ADMIN", "HOTEL_MANAGER");
    const { id } = await context.params;
    const input = hotelMediaInputSchema.parse(await request.json());
    const media = await hotelService.addMedia(id, input);
    return apiSuccess(media, 201);
  },
);
