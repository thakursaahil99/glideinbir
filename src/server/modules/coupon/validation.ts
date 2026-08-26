import { z } from "zod";

export const couponInputSchema = z.object({
  code: z.string().trim().toUpperCase().min(3).max(40),
  type: z.enum(["PERCENTAGE", "FIXED"]),
  value: z.number().positive(),
  minAmount: z.number().nonnegative().optional(),
  maxDiscount: z.number().positive().optional(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  usageLimit: z.number().int().positive().optional(),
  perUserLimit: z.number().int().positive().optional(),
  isActive: z.boolean().default(true),
});
export const couponUpdateSchema = couponInputSchema.partial();

export const validateCouponSchema = z.object({
  code: z.string().trim().min(1),
  subtotal: z.number().nonnegative(),
});
