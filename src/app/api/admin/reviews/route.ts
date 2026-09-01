import { NextRequest } from "next/server";
import { requireRole } from "@/server/auth/guards";
import { reviewService } from "@/server/modules/review/service";
import { withErrorHandling, apiSuccess } from "@/server/lib/api-response";

export const GET = withErrorHandling(async (request: NextRequest) => {
  await requireRole("SUPER_ADMIN", "CONTENT_MANAGER", "BOOKING_MANAGER");
  const status = request.nextUrl.searchParams.get("status") as "PENDING" | "APPROVED" | "HIDDEN" | null;
  const reviews = await reviewService.list(status ?? undefined);
  return apiSuccess(reviews);
});
