import { NextRequest } from "next/server";
import { hotelService } from "@/server/modules/hotel/service";
import { listHotelsQuerySchema } from "@/server/modules/hotel/validation";
import { withErrorHandling, apiSuccess } from "@/server/lib/api-response";

export const GET = withErrorHandling(async (request: NextRequest) => {
  const query = listHotelsQuerySchema.parse(Object.fromEntries(request.nextUrl.searchParams));
  const result = await hotelService.listPublic(query);
  return apiSuccess(result);
});
