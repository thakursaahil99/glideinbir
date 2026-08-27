import { NextRequest } from "next/server";
import { requireRole } from "@/server/auth/guards";
import { itemService } from "@/server/modules/adventure/service";
import { itemInputSchema, listItemsQuerySchema } from "@/server/modules/adventure/validation";
import { withErrorHandling, apiSuccess } from "@/server/lib/api-response";

export const GET = withErrorHandling(async (request: NextRequest) => {
  await requireRole("SUPER_ADMIN", "ADVENTURE_MANAGER");
  const query = listItemsQuerySchema.parse(Object.fromEntries(request.nextUrl.searchParams));
  const result = await itemService.listAdmin(query);
  return apiSuccess(result);
});

export const POST = withErrorHandling(async (request: NextRequest) => {
  await requireRole("SUPER_ADMIN", "ADVENTURE_MANAGER");
  const input = itemInputSchema.parse(await request.json());
  const item = await itemService.create(input);
  return apiSuccess(item, 201);
});
