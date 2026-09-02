import { NextRequest } from "next/server";
import { requireRole } from "@/server/auth/guards";
import { blogService } from "@/server/modules/blog/service";
import { blogPostUpdateSchema } from "@/server/modules/blog/validation";
import { withErrorHandling, apiSuccess } from "@/server/lib/api-response";

export const PATCH = withErrorHandling(
  async (request: NextRequest, context: { params: Promise<{ id: string }> }) => {
    await requireRole("SUPER_ADMIN", "CONTENT_MANAGER");
    const { id } = await context.params;
    const input = blogPostUpdateSchema.parse(await request.json());
    const post = await blogService.update(id, input);
    return apiSuccess(post);
  },
);

export const DELETE = withErrorHandling(
  async (_request: Request, context: { params: Promise<{ id: string }> }) => {
    const user = await requireRole("SUPER_ADMIN", "CONTENT_MANAGER");
    const { id } = await context.params;
    await blogService.remove(id, user.id);
    return apiSuccess({ deleted: true });
  },
);
