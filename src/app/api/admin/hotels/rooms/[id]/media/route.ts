import { NextRequest } from "next/server";
import { requireRole } from "@/server/auth/guards";
import { roomService } from "@/server/modules/hotel/service";
import { roomMediaInputSchema } from "@/server/modules/hotel/validation";
import { withErrorHandling, apiSuccess } from "@/server/lib/api-response";

export const POST = withErrorHandling(
  async (request: NextRequest, context: { params: Promise<{ id: string }> }) => {
    await requireRole("SUPER_ADMIN", "HOTEL_MANAGER");
    const { id } = await context.params;
    const input = roomMediaInputSchema.parse(await request.json());
    const media = await roomService.addMedia(id, input);
    return apiSuccess(media, 201);
  },
);
