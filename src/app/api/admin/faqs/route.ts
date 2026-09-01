import { NextRequest } from "next/server";
import { requireRole } from "@/server/auth/guards";
import { faqService } from "@/server/modules/faq/service";
import { faqInputSchema } from "@/server/modules/faq/validation";
import { withErrorHandling, apiSuccess } from "@/server/lib/api-response";

export const GET = withErrorHandling(async () => {
  await requireRole("SUPER_ADMIN", "CONTENT_MANAGER");
  const faqs = await faqService.list();
  return apiSuccess(faqs);
});

export const POST = withErrorHandling(async (request: NextRequest) => {
  await requireRole("SUPER_ADMIN", "CONTENT_MANAGER");
  const input = faqInputSchema.parse(await request.json());
  const faq = await faqService.create(input);
  return apiSuccess(faq, 201);
});
