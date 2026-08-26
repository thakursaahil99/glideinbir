import { NextRequest } from "next/server";
import { requireRole } from "@/server/auth/guards";
import { courseService } from "@/server/modules/school/service";
import { courseMediaInputSchema } from "@/server/modules/school/validation";
import { withErrorHandling, apiSuccess } from "@/server/lib/api-response";

export const POST = withErrorHandling(
  async (request: NextRequest, context: { params: Promise<{ id: string }> }) => {
    await requireRole("SUPER_ADMIN", "SCHOOL_MANAGER");
    const { id } = await context.params;
    const input = courseMediaInputSchema.parse(await request.json());
    const media = await courseService.addMedia(id, input);
    return apiSuccess(media, 201);
  },
);
