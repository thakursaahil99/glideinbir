import { NextRequest } from "next/server";
import { requireRole } from "@/server/auth/guards";
import { userService } from "@/server/modules/user/service";
import { updateUserSchema } from "@/server/modules/user/validation";
import { withErrorHandling, apiSuccess } from "@/server/lib/api-response";

export const PATCH = withErrorHandling(
  async (request: NextRequest, context: { params: Promise<{ id: string }> }) => {
    const actor = await requireRole("SUPER_ADMIN");
    const { id } = await context.params;
    const input = updateUserSchema.parse(await request.json());
    const user = await userService.update(id, actor.id, input);
    return apiSuccess(user);
  },
);
