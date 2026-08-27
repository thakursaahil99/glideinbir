import { NextRequest } from "next/server";
import { requireRole } from "@/server/auth/guards";
import { slotService } from "@/server/modules/travel/service";
import { slotInputSchema, slotsQuerySchema } from "@/server/modules/travel/validation";
import { withErrorHandling, apiSuccess } from "@/server/lib/api-response";

export const GET = withErrorHandling(
  async (request: NextRequest, context: { params: Promise<{ id: string }> }) => {
    await requireRole("SUPER_ADMIN", "TRAVEL_MANAGER");
    const { id } = await context.params;
    const { date } = slotsQuerySchema.parse(Object.fromEntries(request.nextUrl.searchParams));
    const slots = await slotService.listForRoute(id, date);
    return apiSuccess(slots);
  },
);

export const POST = withErrorHandling(
  async (request: NextRequest, context: { params: Promise<{ id: string }> }) => {
    await requireRole("SUPER_ADMIN", "TRAVEL_MANAGER");
    const { id } = await context.params;
    const input = slotInputSchema.parse(await request.json());
    const slot = await slotService.create(id, input);
    return apiSuccess(slot, 201);
  },
);
