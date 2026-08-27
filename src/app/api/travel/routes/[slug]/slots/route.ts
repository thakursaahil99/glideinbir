import { NextRequest } from "next/server";
import { slotService } from "@/server/modules/travel/service";
import { slotsQuerySchema } from "@/server/modules/travel/validation";
import { withErrorHandling, apiSuccess } from "@/server/lib/api-response";

export const GET = withErrorHandling(
  async (request: NextRequest, context: { params: Promise<{ slug: string }> }) => {
    const { slug } = await context.params;
    const { date } = slotsQuerySchema.parse(Object.fromEntries(request.nextUrl.searchParams));
    const slots = await slotService.listForRouteSlug(slug, date);
    return apiSuccess(slots);
  },
);
