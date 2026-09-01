import { NextRequest } from "next/server";
import { z } from "zod";
import { requireRole } from "@/server/auth/guards";
import { contactService } from "@/server/modules/contact/service";
import { withErrorHandling, apiSuccess } from "@/server/lib/api-response";

const patchSchema = z.object({ isRead: z.boolean() });

export const PATCH = withErrorHandling(
  async (request: NextRequest, context: { params: Promise<{ id: string }> }) => {
    await requireRole("SUPER_ADMIN", "CONTENT_MANAGER");
    const { id } = await context.params;
    const { isRead } = patchSchema.parse(await request.json());
    const message = await contactService.markRead(id, isRead);
    return apiSuccess(message);
  },
);
