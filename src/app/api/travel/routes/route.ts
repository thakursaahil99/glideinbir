import { NextRequest } from "next/server";
import { routeService } from "@/server/modules/travel/service";
import { listRoutesQuerySchema } from "@/server/modules/travel/validation";
import { withErrorHandling, apiSuccess } from "@/server/lib/api-response";

export const GET = withErrorHandling(async (request: NextRequest) => {
  const query = listRoutesQuerySchema.parse(Object.fromEntries(request.nextUrl.searchParams));
  const result = await routeService.listPublic(query);
  return apiSuccess(result);
});
