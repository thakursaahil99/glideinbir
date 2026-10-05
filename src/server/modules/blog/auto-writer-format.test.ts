import { describe, it, expect } from "vitest";
import { extractJson, sanitizeLinks, findForbidden, validateGenerated } from "./auto-writer-format";

const allowed = new Set(["/paragliding", "/hotels", "/blog/how-to-reach-bir-billing"]);

describe("extractJson", () => {
  it("parses plain JSON", () => {
    expect(extractJson('{"a":1}')).toEqual({ a: 1 });
  });
  it("parses JSON inside code fences and surrounding prose", () => {
    expect(extractJson('Here you go:\n```json\n{"a":"x"}\n```\nDone')).toEqual({ a: "x" });
  });
  it("throws when there is no object", () => {
    expect(() => extractJson("nothing here")).toThrow();
  });
});

describe("sanitizeLinks", () => {
  it("keeps allowed internal links, normalising trailing slash and query", () => {
    expect(sanitizeLinks("See [flights](/paragliding/) now", allowed)).toBe("See [flights](/paragliding) now");
    expect(sanitizeLinks("[x](/hotels?a=1)", allowed)).toBe("[x](/hotels)");
  });
  it("drops external and unknown links but keeps their text", () => {
    expect(sanitizeLinks("[site](https://evil.com) and [nope](/made-up)", allowed)).toBe("site and nope");
  });
});

describe("findForbidden", () => {
  it("flags prices, phone numbers and emails", () => {
    expect(findForbidden("costs ₹2,500 per person")).not.toBeNull();
    expect(findForbidden("only Rs. 3000")).not.toBeNull();
    expect(findForbidden("call +91 98053 38877")).not.toBeNull();
    expect(findForbidden("mail hello@glideinbir.com")).not.toBeNull();
  });
  it("allows ordinary numbers", () => {
    expect(findForbidden("about 40 minutes up, a 15 to 30 minute flight, 520 km")).toBeNull();
  });
});

describe("validateGenerated", () => {
  const body = "## Heading\n\n" + "A useful sentence about flying in Bir Billing. ".repeat(50);
  it("accepts a good draft and sanitises links", () => {
    const out = validateGenerated(
      { title: "A Good Guide to Bir", excerpt: "x".repeat(60), body: `${body}\n\n[bad](https://x.com)` },
      allowed,
    );
    expect(out.body).not.toContain("https://x.com");
  });
  it("rejects short bodies and drafts with prices", () => {
    expect(() => validateGenerated({ title: "A Good Guide to Bir", excerpt: "x".repeat(60), body: "short" }, allowed)).toThrow();
    expect(() =>
      validateGenerated({ title: "A Good Guide to Bir", excerpt: "x".repeat(60), body: `${body} It costs ₹2500.` }, allowed),
    ).toThrow(/price/);
  });
});
