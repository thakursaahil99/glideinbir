import { instructorService } from "@/server/modules/school/service";
import { withErrorHandling, apiSuccess } from "@/server/lib/api-response";

export const GET = withErrorHandling(async () => {
  const instructors = await instructorService.listPublic();
  return apiSuccess(instructors);
});
