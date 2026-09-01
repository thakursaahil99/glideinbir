import { describe, it, expect } from "vitest";
import { formatINR, formatDate } from "./format";

describe("formatINR", () => {
  it("formats a number as Indian Rupees with no decimals", () => {
    expect(formatINR(2500)).toBe("₹2,500");
  });

  it("formats a numeric string the same way", () => {
    expect(formatINR("1200.00")).toBe("₹1,200");
  });

  it("applies Indian digit grouping for large amounts", () => {
    expect(formatINR(1234567)).toBe("₹12,34,567");
  });
});

describe("formatDate", () => {
  it("renders a UTC calendar date regardless of local timezone", () => {
    // Midnight UTC on this date must never roll back to the previous day.
    expect(formatDate("2026-12-01T00:00:00.000Z")).toBe("1 Dec 2026");
  });

  it("accepts a Date object directly", () => {
    expect(formatDate(new Date("2026-01-15T00:00:00.000Z"))).toBe("15 Jan 2026");
  });
});
