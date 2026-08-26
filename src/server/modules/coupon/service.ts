import { Prisma } from "@prisma/client";
import type { z } from "zod";
import { prisma } from "@/server/db/prisma";
import { ConflictError, NotFoundError, ValidationError } from "@/server/lib/errors";
import type { couponInputSchema, couponUpdateSchema } from "./validation";

type CouponInput = z.infer<typeof couponInputSchema>;
type CouponUpdate = z.infer<typeof couponUpdateSchema>;

function mapUniqueConstraint(error: unknown, message: string) {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
    return new ConflictError(message);
  }
  return error instanceof Error ? error : new Error(String(error));
}

export const couponService = {
  list: () => prisma.coupon.findMany({ orderBy: { createdAt: "desc" } }),

  async create(input: CouponInput) {
    if (input.endDate <= input.startDate) {
      throw new ValidationError("endDate must be after startDate");
    }
    try {
      return await prisma.coupon.create({ data: input });
    } catch (error) {
      throw mapUniqueConstraint(error, "A coupon with this code already exists");
    }
  },

  async update(id: string, input: CouponUpdate) {
    const existing = await prisma.coupon.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError("Coupon not found");
    const startDate = input.startDate ?? existing.startDate;
    const endDate = input.endDate ?? existing.endDate;
    if (endDate <= startDate) throw new ValidationError("endDate must be after startDate");
    try {
      return await prisma.coupon.update({ where: { id }, data: input });
    } catch (error) {
      throw mapUniqueConstraint(error, "A coupon with this code already exists");
    }
  },

  async remove(id: string) {
    const existing = await prisma.coupon.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError("Coupon not found");
    await prisma.coupon.delete({ where: { id } });
  },

  // Server-validated discount, used both by /api/coupons/validate (preview)
  // and by the booking service when a coupon code is supplied at checkout.
  async validateForCheckout(code: string, subtotal: number, userId?: string) {
    const coupon = await prisma.coupon.findUnique({ where: { code: code.trim().toUpperCase() } });
    if (!coupon || !coupon.isActive) throw new NotFoundError("Coupon not found");

    const now = new Date();
    if (now < coupon.startDate || now > coupon.endDate) {
      throw new ValidationError("This coupon is not currently valid");
    }

    const minAmount = coupon.minAmount?.toNumber();
    if (minAmount !== undefined && subtotal < minAmount) {
      throw new ValidationError(`This coupon requires a minimum order of ${minAmount}`);
    }

    if (coupon.usageLimit !== null) {
      const usageCount = await prisma.couponUsage.count({ where: { couponId: coupon.id } });
      if (usageCount >= coupon.usageLimit) {
        throw new ValidationError("This coupon has reached its usage limit");
      }
    }

    if (userId && coupon.perUserLimit !== null) {
      const userUsageCount = await prisma.couponUsage.count({ where: { couponId: coupon.id, userId } });
      if (userUsageCount >= coupon.perUserLimit) {
        throw new ValidationError("You have already used this coupon the maximum number of times");
      }
    }

    const rawDiscount =
      coupon.type === "PERCENTAGE" ? subtotal * (coupon.value.toNumber() / 100) : coupon.value.toNumber();
    const maxDiscount = coupon.maxDiscount?.toNumber();
    const capped = maxDiscount !== undefined ? Math.min(rawDiscount, maxDiscount) : rawDiscount;
    const discountAmount = Math.min(capped, subtotal);

    return { coupon, discountAmount };
  },
};
