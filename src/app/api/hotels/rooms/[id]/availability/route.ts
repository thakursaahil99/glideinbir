import { NextRequest } from "next/server";
import { roomService } from "@/server/modules/hotel/service";
import { availabilityQuerySchema } from "@/server/modules/hotel/validation";
import { withErrorHandling, apiSuccess } from "@/server/lib/api-response";

export const GET = withErrorHandling(
  async (request: NextRequest, context: { params: Promise<{ id: string }> }) => {
    const { id } = await context.params;
    const query = availabilityQuerySchema.parse(Object.fromEntries(request.nextUrl.searchParams));
    const result = await roomService.checkAvailability(id, query);
    return apiSuccess(result);
  },
);
