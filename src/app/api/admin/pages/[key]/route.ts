import { NextRequest } from "next/server";
import { requireRole } from "@/server/auth/guards";
import { pageContentService } from "@/server/modules/page-content/service";
import { pageContentUpdateSchema } from "@/server/modules/page-content/validation";
import { withErrorHandling, apiSuccess } from "@/server/lib/api-response";

export const PUT = withErrorHandling(
  async (request: NextRequest, context: { params: Promise<{ key: string }> }) => {
    await requireRole("SUPER_ADMIN", "CONTENT_MANAGER");
    const { key } = await context.params;
    const input = pageContentUpdateSchema.parse(await request.json());
    const page = await pageContentService.upsert(key, input);
    return apiSuccess(page);
  },
);
