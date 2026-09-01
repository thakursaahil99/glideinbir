import { describe, it, expect } from "vitest";
import { slugify } from "./slugify";

describe("slugify", () => {
  it("lowercases and hyphenates spaces", () => {
    expect(slugify("Triund Trek")).toBe("triund-trek");
  });

  it("strips punctuation and collapses runs of non-alphanumerics", () => {
    expect(slugify("Bir Billing — Volvo/Taxi!!")).toBe("bir-billing-volvo-taxi");
  });

  it("trims leading/trailing hyphens", () => {
    expect(slugify("  -- Glass House Cottage -- ")).toBe("glass-house-cottage");
  });

  it("handles an already-clean slug unchanged", () => {
    expect(slugify("bara-bhangal-expedition-trek")).toBe("bara-bhangal-expedition-trek");
  });
});
