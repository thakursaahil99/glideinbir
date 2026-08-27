import { itemService } from "@/server/modules/adventure/service";
import { withErrorHandling, apiSuccess } from "@/server/lib/api-response";

export const GET = withErrorHandling(
  async (_request: Request, context: { params: Promise<{ slug: string }> }) => {
    const { slug } = await context.params;
    const item = await itemService.getBySlug(slug);
    return apiSuccess(item);
  },
);
