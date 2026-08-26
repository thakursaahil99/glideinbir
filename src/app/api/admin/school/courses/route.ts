import { NextRequest } from "next/server";
import { requireRole } from "@/server/auth/guards";
import { courseService } from "@/server/modules/school/service";
import { courseInputSchema, listCoursesQuerySchema } from "@/server/modules/school/validation";
import { withErrorHandling, apiSuccess } from "@/server/lib/api-response";

export const GET = withErrorHandling(async (request: NextRequest) => {
  await requireRole("SUPER_ADMIN", "SCHOOL_MANAGER");
  const query = listCoursesQuerySchema.parse(Object.fromEntries(request.nextUrl.searchParams));
  const result = await courseService.listAdmin(query);
  return apiSuccess(result);
});

export const POST = withErrorHandling(async (request: NextRequest) => {
  await requireRole("SUPER_ADMIN", "SCHOOL_MANAGER");
  const input = courseInputSchema.parse(await request.json());
  const course = await courseService.create(input);
  return apiSuccess(course, 201);
});
