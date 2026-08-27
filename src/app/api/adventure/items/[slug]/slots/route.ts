import { NextRequest } from "next/server";
import { slotService } from "@/server/modules/adventure/service";
import { slotsQuerySchema } from "@/server/modules/adventure/validation";
import { withErrorHandling, apiSuccess } from "@/server/lib/api-response";

export const GET = withErrorHandling(
  async (request: NextRequest, context: { params: Promise<{ slug: string }> }) => {
    const { slug } = await context.params;
    const { date } = slotsQuerySchema.parse(Object.fromEntries(request.nextUrl.searchParams));
    const slots = await slotService.listForItemSlug(slug, date);
    return apiSuccess(slots);
  },
);
