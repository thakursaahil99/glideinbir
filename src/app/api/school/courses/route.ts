import { NextRequest } from "next/server";
import { courseService } from "@/server/modules/school/service";
import { listCoursesQuerySchema } from "@/server/modules/school/validation";
import { withErrorHandling, apiSuccess } from "@/server/lib/api-response";

export const GET = withErrorHandling(async (request: NextRequest) => {
  const query = listCoursesQuerySchema.parse(Object.fromEntries(request.nextUrl.searchParams));
  const result = await courseService.listPublic(query);
  return apiSuccess(result);
});
