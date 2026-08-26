import { NextRequest } from "next/server";
import { requireRole } from "@/server/auth/guards";
import { hotelService } from "@/server/modules/hotel/service";
import { hotelInputSchema, listHotelsQuerySchema } from "@/server/modules/hotel/validation";
import { withErrorHandling, apiSuccess } from "@/server/lib/api-response";

export const GET = withErrorHandling(async (request: NextRequest) => {
  await requireRole("SUPER_ADMIN", "HOTEL_MANAGER");
  const query = listHotelsQuerySchema.parse(Object.fromEntries(request.nextUrl.searchParams));
  const result = await hotelService.listAdmin(query);
  return apiSuccess(result);
});

export const POST = withErrorHandling(async (request: NextRequest) => {
  await requireRole("SUPER_ADMIN", "HOTEL_MANAGER");
  const input = hotelInputSchema.parse(await request.json());
  const hotel = await hotelService.create(input);
  return apiSuccess(hotel, 201);
});
