import { NextRequest } from "next/server";
import { requireRole } from "@/server/auth/guards";
import { itemService } from "@/server/modules/adventure/service";
import { mediaInputSchema } from "@/server/modules/adventure/validation";
import { withErrorHandling, apiSuccess } from "@/server/lib/api-response";

export const POST = withErrorHandling(
  async (request: NextRequest, context: { params: Promise<{ id: string }> }) => {
    await requireRole("SUPER_ADMIN", "ADVENTURE_MANAGER");
    const { id } = await context.params;
    const input = mediaInputSchema.parse(await request.json());
    const media = await itemService.addMedia(id, input);
    return apiSuccess(media, 201);
  },
);
