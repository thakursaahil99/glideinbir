import { NextRequest } from "next/server";
import { requireRole } from "@/server/auth/guards";
import { packageService } from "@/server/modules/paragliding/service";
import { mediaInputSchema } from "@/server/modules/paragliding/validation";
import { withErrorHandling, apiSuccess } from "@/server/lib/api-response";

export const POST = withErrorHandling(
  async (request: NextRequest, context: { params: Promise<{ id: string }> }) => {
    await requireRole("SUPER_ADMIN", "PARAGLIDING_MANAGER");
    const { id } = await context.params;
    const input = mediaInputSchema.parse(await request.json());
    const media = await packageService.addMedia(id, input);
    return apiSuccess(media, 201);
  },
);
