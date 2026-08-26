import { NextRequest } from "next/server";
import { requireRole } from "@/server/auth/guards";
import { packageService } from "@/server/modules/paragliding/service";
import { packageInputSchema, listPackagesQuerySchema } from "@/server/modules/paragliding/validation";
import { withErrorHandling, apiSuccess } from "@/server/lib/api-response";

export const GET = withErrorHandling(async (request: NextRequest) => {
  await requireRole("SUPER_ADMIN", "PARAGLIDING_MANAGER");
  const query = listPackagesQuerySchema.parse(Object.fromEntries(request.nextUrl.searchParams));
  const result = await packageService.listAdmin(query);
  return apiSuccess(result);
});

export const POST = withErrorHandling(async (request: NextRequest) => {
  await requireRole("SUPER_ADMIN", "PARAGLIDING_MANAGER");
  const input = packageInputSchema.parse(await request.json());
  const pkg = await packageService.create(input);
  return apiSuccess(pkg, 201);
});
