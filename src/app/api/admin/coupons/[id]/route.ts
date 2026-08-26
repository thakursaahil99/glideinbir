import { NextRequest } from "next/server";
import { requireRole } from "@/server/auth/guards";
import { couponService } from "@/server/modules/coupon/service";
import { couponUpdateSchema } from "@/server/modules/coupon/validation";
import { withErrorHandling, apiSuccess } from "@/server/lib/api-response";

export const PATCH = withErrorHandling(
  async (request: NextRequest, context: { params: Promise<{ id: string }> }) => {
    await requireRole("SUPER_ADMIN", "FINANCE_MANAGER");
    const { id } = await context.params;
    const input = couponUpdateSchema.parse(await request.json());
    const coupon = await couponService.update(id, input);
    return apiSuccess(coupon);
  },
);

export const DELETE = withErrorHandling(
  async (_request: Request, context: { params: Promise<{ id: string }> }) => {
    await requireRole("SUPER_ADMIN", "FINANCE_MANAGER");
    const { id } = await context.params;
    await couponService.remove(id);
    return apiSuccess({ deleted: true });
  },
);
