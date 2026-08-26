import { NextRequest } from "next/server";
import { requireRole } from "@/server/auth/guards";
import { couponService } from "@/server/modules/coupon/service";
import { couponInputSchema } from "@/server/modules/coupon/validation";
import { withErrorHandling, apiSuccess } from "@/server/lib/api-response";

export const GET = withErrorHandling(async () => {
  await requireRole("SUPER_ADMIN", "BOOKING_MANAGER", "FINANCE_MANAGER");
  const coupons = await couponService.list();
  return apiSuccess(coupons);
});

export const POST = withErrorHandling(async (request: NextRequest) => {
  await requireRole("SUPER_ADMIN", "FINANCE_MANAGER");
  const input = couponInputSchema.parse(await request.json());
  const coupon = await couponService.create(input);
  return apiSuccess(coupon, 201);
});
