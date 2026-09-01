// Pure — subtotal → (minus discount) → (plus tax) → (plus service fee).
// Kept in its own zero-dependency file (no repository/prisma imports) so
// it can be unit-tested without a database connection.
export function computeBookingTotals(params: {
  subtotal: number;
  discountAmount: number;
  taxRate: number;
  serviceFee: number;
}) {
  const taxableAmount = params.subtotal - params.discountAmount;
  const taxAmount = taxableAmount * params.taxRate;
  const totalAmount = taxableAmount + taxAmount + params.serviceFee;
  return { taxableAmount, taxAmount, totalAmount };
}
