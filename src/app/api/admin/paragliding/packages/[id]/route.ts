import { NextRequest } from "next/server";
import { requireRole } from "@/server/auth/guards";
import { packageService } from "@/server/modules/paragliding/service";
import { packageUpdateSchema } from "@/server/modules/paragliding/validation";
import { withErrorHandling, apiSuccess } from "@/server/lib/api-response";

export const GET = withErrorHandling(
  async (_request: Request, context: { params: Promise<{ id: string }> }) => {
    await requireRole("SUPER_ADMIN", "PARAGLIDING_MANAGER");
    const { id } = await context.params;
    const pkg = await packageService.getByIdForAdmin(id);
    return apiSuccess(pkg);
  },
);

export const PATCH = withErrorHandling(
  async (request: NextRequest, context: { params: Promise<{ id: string }> }) => {
    await requireRole("SUPER_ADMIN", "PARAGLIDING_MANAGER");
    const { id } = await context.params;
    const input = packageUpdateSchema.parse(await request.json());
    const pkg = await packageService.update(id, input);
    return apiSuccess(pkg);
  },
);

export const DELETE = withErrorHandling(
  async (_request: Request, context: { params: Promise<{ id: string }> }) => {
    const user = await requireRole("SUPER_ADMIN", "PARAGLIDING_MANAGER");
    const { id } = await context.params;
    await packageService.remove(id, user.id);
    return apiSuccess({ deleted: true });
  },
);
