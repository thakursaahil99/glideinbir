import { describe, expect, it } from "vitest";
import { BOOKING_TOKEN_INR, amountPaid, amountToCharge, tokenAmount } from "./booking-token";

describe("booking token", () => {
  it("charges only the token on a booking bigger than it", () => {
    expect(tokenAmount(3500)).toBe(BOOKING_TOKEN_INR);
    expect(BOOKING_TOKEN_INR).toBe(600);
  });

  it("charges the full amount when the booking is cheaper than the token", () => {
    expect(tokenAmount(450)).toBe(450);
    expect(tokenAmount(600)).toBe(600);
  });

  it("sums only successful payments", () => {
    expect(
      amountPaid([
        { status: "SUCCESS", amount: "600" },
        { status: "FAILED", amount: "600" },
        { status: "CREATED", amount: "600" },
      ]),
    ).toBe(600);
  });

  it("charges the full amount by default and only the token when chosen", () => {
    expect(amountToCharge(3500, "full")).toBe(3500);
    expect(amountToCharge(3500, "token")).toBe(600);
    expect(amountToCharge(450, "token")).toBe(450);
  });
});
