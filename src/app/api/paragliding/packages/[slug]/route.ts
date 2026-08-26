import { packageService } from "@/server/modules/paragliding/service";
import { withErrorHandling, apiSuccess } from "@/server/lib/api-response";

export const GET = withErrorHandling(
  async (_request: Request, context: { params: Promise<{ slug: string }> }) => {
    const { slug } = await context.params;
    const pkg = await packageService.getBySlug(slug);
    return apiSuccess(pkg);
  },
);
