import { NextRequest } from "next/server";
import { requireRole } from "@/server/auth/guards";
import { userService } from "@/server/modules/user/service";
import { createStaffSchema } from "@/server/modules/user/validation";
import { withErrorHandling, apiSuccess } from "@/server/lib/api-response";

export const GET = withErrorHandling(async () => {
  await requireRole("SUPER_ADMIN");
  const users = await userService.list();
  return apiSuccess(users);
});

export const POST = withErrorHandling(async (request: NextRequest) => {
  await requireRole("SUPER_ADMIN");
  const input = createStaffSchema.parse(await request.json());
  const user = await userService.createStaff(input);
  return apiSuccess(user, 201);
});
