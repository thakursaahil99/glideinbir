import { courseService } from "@/server/modules/school/service";
import { withErrorHandling, apiSuccess } from "@/server/lib/api-response";

export const GET = withErrorHandling(
  async (_request: Request, context: { params: Promise<{ slug: string }> }) => {
    const { slug } = await context.params;
    const course = await courseService.getBySlug(slug);
    return apiSuccess(course);
  },
);
