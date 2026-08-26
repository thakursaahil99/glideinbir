import { NextRequest } from "next/server";
import { getCurrentUser } from "@/server/auth/guards";
import { couponService } from "@/server/modules/coupon/service";
import { validateCouponSchema } from "@/server/modules/coupon/validation";
import { withErrorHandling, apiSuccess } from "@/server/lib/api-response";

export const POST = withErrorHandling(async (request: NextRequest) => {
  const { code, subtotal } = validateCouponSchema.parse(await request.json());
  const user = await getCurrentUser();
  const result = await couponService.validateForCheckout(code, subtotal, user?.id);
  return apiSuccess({ code: result.coupon.code, discountAmount: result.discountAmount });
});
