import { batchService } from "@/server/modules/school/service";
import { withErrorHandling, apiSuccess } from "@/server/lib/api-response";

export const GET = withErrorHandling(
  async (_request: Request, context: { params: Promise<{ slug: string }> }) => {
    const { slug } = await context.params;
    const batches = await batchService.listForCourseSlug(slug);
    return apiSuccess(batches);
  },
);
