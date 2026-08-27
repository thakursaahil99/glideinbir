import { NextRequest } from "next/server";
import { itemService } from "@/server/modules/adventure/service";
import { listItemsQuerySchema } from "@/server/modules/adventure/validation";
import { withErrorHandling, apiSuccess } from "@/server/lib/api-response";

export const GET = withErrorHandling(async (request: NextRequest) => {
  const query = listItemsQuerySchema.parse(Object.fromEntries(request.nextUrl.searchParams));
  const result = await itemService.listPublic(query);
  return apiSuccess(result);
});
