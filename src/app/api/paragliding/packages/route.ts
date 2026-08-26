import { NextRequest } from "next/server";
import { packageService } from "@/server/modules/paragliding/service";
import { listPackagesQuerySchema } from "@/server/modules/paragliding/validation";
import { withErrorHandling, apiSuccess } from "@/server/lib/api-response";

export const GET = withErrorHandling(async (request: NextRequest) => {
  const query = listPackagesQuerySchema.parse(Object.fromEntries(request.nextUrl.searchParams));
  const result = await packageService.listPublic(query);
  return apiSuccess(result);
});
