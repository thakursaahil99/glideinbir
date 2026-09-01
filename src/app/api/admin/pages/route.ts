import { requireRole } from "@/server/auth/guards";
import { pageContentService } from "@/server/modules/page-content/service";
import { withErrorHandling, apiSuccess } from "@/server/lib/api-response";

export const GET = withErrorHandling(async () => {
  await requireRole("SUPER_ADMIN", "CONTENT_MANAGER");
  const pages = await pageContentService.list();
  return apiSuccess(pages);
});
