// Pre-booking token: the minimum paid online to lock a booking (the balance
// is paid in person in Bir). The customer may also pay the full amount up
// front — full is the default. A booking cheaper than the token is always
// paid in full. Shared by the server (Razorpay order amount) and the UI.
export const BOOKING_TOKEN_INR = 600;

export type PayOption = "full" | "token";

export function tokenAmount(totalRupees: number): number {
  return Math.min(totalRupees, BOOKING_TOKEN_INR);
}

/** What to charge online right now for the chosen option (never below the token). */
export function amountToCharge(totalRupees: number, option: PayOption): number {
  return option === "token" ? tokenAmount(totalRupees) : totalRupees;
}

type PaymentLike = { status: string; amount: { toString(): string } };

/** Sum of successful payments on a booking, in rupees. */
export function amountPaid(payments: PaymentLike[]): number {
  return payments.filter((p) => p.status === "SUCCESS").reduce((sum, p) => sum + Number(p.amount.toString()), 0);
}
