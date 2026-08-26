import { NextRequest } from "next/server";
import { requireRole } from "@/server/auth/guards";
import { roomService } from "@/server/modules/hotel/service";
import { availabilityOverrideSchema } from "@/server/modules/hotel/validation";
import { withErrorHandling, apiSuccess } from "@/server/lib/api-response";

// Per-date manual override — block a date (maintenance) or correct
// totalRooms for one specific day without touching the room's default.
export const PATCH = withErrorHandling(
  async (request: NextRequest, context: { params: Promise<{ id: string }> }) => {
    await requireRole("SUPER_ADMIN", "HOTEL_MANAGER");
    const { id } = await context.params;
    const input = availabilityOverrideSchema.parse(await request.json());
    const row = await roomService.overrideAvailability(id, input);
    return apiSuccess(row);
  },
);
