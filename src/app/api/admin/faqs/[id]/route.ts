import { NextRequest } from "next/server";
import { requireRole } from "@/server/auth/guards";
import { faqService } from "@/server/modules/faq/service";
import { faqUpdateSchema } from "@/server/modules/faq/validation";
import { withErrorHandling, apiSuccess } from "@/server/lib/api-response";

export const PATCH = withErrorHandling(
  async (request: NextRequest, context: { params: Promise<{ id: string }> }) => {
    await requireRole("SUPER_ADMIN", "CONTENT_MANAGER");
    const { id } = await context.params;
    const input = faqUpdateSchema.parse(await request.json());
    const faq = await faqService.update(id, input);
    return apiSuccess(faq);
  },
);

export const DELETE = withErrorHandling(
  async (_request: Request, context: { params: Promise<{ id: string }> }) => {
    const user = await requireRole("SUPER_ADMIN", "CONTENT_MANAGER");
    const { id } = await context.params;
    await faqService.remove(id, user.id);
    return apiSuccess({ deleted: true });
  },
);
