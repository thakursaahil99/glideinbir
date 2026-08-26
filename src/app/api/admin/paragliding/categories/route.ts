import { NextRequest } from "next/server";
import { requireRole } from "@/server/auth/guards";
import { categoryService } from "@/server/modules/paragliding/service";
import { categoryInputSchema } from "@/server/modules/paragliding/validation";
import { withErrorHandling, apiSuccess } from "@/server/lib/api-response";

export const GET = withErrorHandling(async () => {
  await requireRole("SUPER_ADMIN", "PARAGLIDING_MANAGER");
  const categories = await categoryService.list();
  return apiSuccess(categories);
});

export const POST = withErrorHandling(async (request: NextRequest) => {
  await requireRole("SUPER_ADMIN", "PARAGLIDING_MANAGER");
  const input = categoryInputSchema.parse(await request.json());
  const category = await categoryService.create(input);
  return apiSuccess(category, 201);
});
