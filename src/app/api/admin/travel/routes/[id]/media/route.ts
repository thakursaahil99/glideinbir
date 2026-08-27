import { NextRequest } from "next/server";
import { requireRole } from "@/server/auth/guards";
import { routeService } from "@/server/modules/travel/service";
import { mediaInputSchema } from "@/server/modules/travel/validation";
import { withErrorHandling, apiSuccess } from "@/server/lib/api-response";

export const POST = withErrorHandling(
  async (request: NextRequest, context: { params: Promise<{ id: string }> }) => {
    await requireRole("SUPER_ADMIN", "TRAVEL_MANAGER");
    const { id } = await context.params;
    const input = mediaInputSchema.parse(await request.json());
    const media = await routeService.addMedia(id, input);
    return apiSuccess(media, 201);
  },
);
