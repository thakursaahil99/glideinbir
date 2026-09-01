import { NextRequest } from "next/server";
import { requireRole } from "@/server/auth/guards";
import { reviewService } from "@/server/modules/review/service";
import { reviewModerateSchema } from "@/server/modules/review/validation";
import { withErrorHandling, apiSuccess } from "@/server/lib/api-response";

export const PATCH = withErrorHandling(
  async (request: NextRequest, context: { params: Promise<{ id: string }> }) => {
    await requireRole("SUPER_ADMIN", "CONTENT_MANAGER", "BOOKING_MANAGER");
    const { id } = await context.params;
    const { status } = reviewModerateSchema.parse(await request.json());
    const review = await reviewService.moderate(id, status);
    return apiSuccess(review);
  },
);

export const DELETE = withErrorHandling(
  async (_request: Request, context: { params: Promise<{ id: string }> }) => {
    const user = await requireRole("SUPER_ADMIN", "CONTENT_MANAGER", "BOOKING_MANAGER");
    const { id } = await context.params;
    await reviewService.remove(id, user.id);
    return apiSuccess({ deleted: true });
  },
);
