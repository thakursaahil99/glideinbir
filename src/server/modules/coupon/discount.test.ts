import { describe, it, expect } from "vitest";
import { computeCouponDiscount } from "./discount";

describe("computeCouponDiscount", () => {
  it("computes a straight percentage discount", () => {
    const discount = computeCouponDiscount({ type: "PERCENTAGE", value: 10, subtotal: 2000 });
    expect(discount).toBe(200);
  });

  it("computes a fixed discount, ignoring the subtotal size", () => {
    const discount = computeCouponDiscount({ type: "FIXED", value: 500, subtotal: 5000 });
    expect(discount).toBe(500);
  });

  it("caps a percentage discount at maxDiscount", () => {
    // 20% of 10,000 = 2,000, but capped at 1,000
    const discount = computeCouponDiscount({ type: "PERCENTAGE", value: 20, maxDiscount: 1000, subtotal: 10000 });
    expect(discount).toBe(1000);
  });

  it("never lets a fixed discount exceed the subtotal", () => {
    const discount = computeCouponDiscount({ type: "FIXED", value: 5000, subtotal: 1500 });
    expect(discount).toBe(1500);
  });

  it("applies maxDiscount before the subtotal cap, and the smaller wins", () => {
    const discount = computeCouponDiscount({
      type: "PERCENTAGE",
      value: 50,
      maxDiscount: 800,
      subtotal: 1000, // 50% = 500, under both caps
    });
    expect(discount).toBe(500);
  });

  it("returns 0 for a 0-value coupon", () => {
    expect(computeCouponDiscount({ type: "FIXED", value: 0, subtotal: 1000 })).toBe(0);
  });
});
