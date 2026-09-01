import { requireRole } from "@/server/auth/guards";
import { contactService } from "@/server/modules/contact/service";
import { withErrorHandling, apiSuccess } from "@/server/lib/api-response";

export const GET = withErrorHandling(async () => {
  await requireRole("SUPER_ADMIN", "CONTENT_MANAGER");
  const messages = await contactService.list();
  return apiSuccess(messages);
});
