import { NextRequest } from "next/server";
import { requireRole } from "@/server/auth/guards";
import { amenityService } from "@/server/modules/hotel/service";
import { amenityInputSchema } from "@/server/modules/hotel/validation";
import { withErrorHandling, apiSuccess } from "@/server/lib/api-response";

export const GET = withErrorHandling(async () => {
  await requireRole("SUPER_ADMIN", "HOTEL_MANAGER");
  const amenities = await amenityService.list();
  return apiSuccess(amenities);
});

export const POST = withErrorHandling(async (request: NextRequest) => {
  await requireRole("SUPER_ADMIN", "HOTEL_MANAGER");
  const input = amenityInputSchema.parse(await request.json());
  const amenity = await amenityService.create(input);
  return apiSuccess(amenity, 201);
});
