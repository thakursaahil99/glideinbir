import { describe, it, expect } from "vitest";
import { computeBookingTotals } from "./totals";

describe("computeBookingTotals", () => {
  it("applies GST on the discounted amount, then adds the service fee", () => {
    const result = computeBookingTotals({ subtotal: 2000, discountAmount: 200, taxRate: 0.05, serviceFee: 50 });
    // taxable = 1800, tax = 90, total = 1800 + 90 + 50
    expect(result.taxableAmount).toBe(1800);
    expect(result.taxAmount).toBe(90);
    expect(result.totalAmount).toBe(1940);
  });

  it("handles zero tax rate and zero service fee", () => {
    const result = computeBookingTotals({ subtotal: 1000, discountAmount: 0, taxRate: 0, serviceFee: 0 });
    expect(result.totalAmount).toBe(1000);
  });

  it("handles a discount equal to the full subtotal", () => {
    const result = computeBookingTotals({ subtotal: 500, discountAmount: 500, taxRate: 0.05, serviceFee: 20 });
    expect(result.taxableAmount).toBe(0);
    expect(result.taxAmount).toBe(0);
    expect(result.totalAmount).toBe(20);
  });
});
