import { NextRequest } from "next/server";
import { requireRole } from "@/server/auth/guards";
import { instructorService } from "@/server/modules/school/service";
import { instructorInputSchema } from "@/server/modules/school/validation";
import { withErrorHandling, apiSuccess } from "@/server/lib/api-response";

export const GET = withErrorHandling(async () => {
  await requireRole("SUPER_ADMIN", "SCHOOL_MANAGER");
  const instructors = await instructorService.list();
  return apiSuccess(instructors);
});

export const POST = withErrorHandling(async (request: NextRequest) => {
  await requireRole("SUPER_ADMIN", "SCHOOL_MANAGER");
  const input = instructorInputSchema.parse(await request.json());
  const instructor = await instructorService.create(input);
  return apiSuccess(instructor, 201);
});
