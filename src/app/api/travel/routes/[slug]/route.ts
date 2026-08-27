import { routeService } from "@/server/modules/travel/service";
import { withErrorHandling, apiSuccess } from "@/server/lib/api-response";

export const GET = withErrorHandling(
  async (_request: Request, context: { params: Promise<{ slug: string }> }) => {
    const { slug } = await context.params;
    const route = await routeService.getBySlug(slug);
    return apiSuccess(route);
  },
);
