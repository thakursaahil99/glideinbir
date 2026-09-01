// Pure discount math, pulled out of coupon/service.ts so it's testable
// without a database — the eligibility checks (active, date range, usage
// limits) still live in the service since they need real queries.
export function computeCouponDiscount(params: {
  type: "PERCENTAGE" | "FIXED";
  value: number;
  maxDiscount?: number;
  subtotal: number;
}): number {
  const rawDiscount = params.type === "PERCENTAGE" ? params.subtotal * (params.value / 100) : params.value;
  const capped = params.maxDiscount !== undefined ? Math.min(rawDiscount, params.maxDiscount) : rawDiscount;
  // A discount can never exceed the subtotal it's applied to (no negative totals).
  return Math.min(capped, params.subtotal);
}
