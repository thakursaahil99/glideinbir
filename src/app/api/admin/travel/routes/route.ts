import { NextRequest } from "next/server";
import { requireRole } from "@/server/auth/guards";
import { routeService } from "@/server/modules/travel/service";
import { routeInputSchema, listRoutesQuerySchema } from "@/server/modules/travel/validation";
import { withErrorHandling, apiSuccess } from "@/server/lib/api-response";

export const GET = withErrorHandling(async (request: NextRequest) => {
  await requireRole("SUPER_ADMIN", "TRAVEL_MANAGER");
  const query = listRoutesQuerySchema.parse(Object.fromEntries(request.nextUrl.searchParams));
  const result = await routeService.listAdmin(query);
  return apiSuccess(result);
});

export const POST = withErrorHandling(async (request: NextRequest) => {
  await requireRole("SUPER_ADMIN", "TRAVEL_MANAGER");
  const input = routeInputSchema.parse(await request.json());
  const route = await routeService.create(input);
  return apiSuccess(route, 201);
});
