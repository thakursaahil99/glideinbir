import { NextRequest } from "next/server";
import { requireUser } from "@/server/auth/guards";
import { reviewService } from "@/server/modules/review/service";
import { reviewInputSchema } from "@/server/modules/review/validation";
import { withErrorHandling, apiSuccess } from "@/server/lib/api-response";

export const POST = withErrorHandling(async (request: NextRequest) => {
  const user = await requireUser();
  const input = reviewInputSchema.parse(await request.json());
  const review = await reviewService.create(input, user.id);
  return apiSuccess(review, 201);
});
