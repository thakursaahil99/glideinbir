import { describe, it, expect } from "vitest";
import { isAllowedAdminPath, checkToolCall } from "./authorize";

describe("isAllowedAdminPath", () => {
  it("accepts admin resource paths", () => {
    expect(isAllowedAdminPath("/api/admin/faqs")).toBe(true);
    expect(isAllowedAdminPath("/api/admin/paragliding/packages/abc123")).toBe(true);
    expect(isAllowedAdminPath("/api/admin/bookings?status=PENDING")).toBe(true);
  });

  it("rejects the assistant's own endpoint", () => {
    expect(isAllowedAdminPath("/api/admin/assistant")).toBe(false);
    expect(isAllowedAdminPath("/api/admin/assistant/anything")).toBe(false);
  });

  it("rejects anything outside /api/admin", () => {
    expect(isAllowedAdminPath("/api/auth/login")).toBe(false);
    expect(isAllowedAdminPath("/api/admin/../auth/login")).toBe(false);
    expect(isAllowedAdminPath("https://evil.com/api/admin/faqs")).toBe(false);
    expect(isAllowedAdminPath("/api/adminx/faqs")).toBe(false);
    expect(isAllowedAdminPath("")).toBe(false);
    expect(isAllowedAdminPath(42)).toBe(false);
  });
});

describe("checkToolCall", () => {
  it("allows GET in read-only mode", () => {
    expect(checkToolCall({ method: "get", path: "/api/admin/faqs", mode: "readonly" })).toEqual({
      ok: true,
      method: "GET",
    });
  });

  it("blocks writes in read-only mode", () => {
    const result = checkToolCall({ method: "DELETE", path: "/api/admin/faqs/x", mode: "readonly" });
    expect(result.ok).toBe(false);
  });

  it("allows writes in act mode", () => {
    expect(checkToolCall({ method: "POST", path: "/api/admin/faqs", mode: "act" })).toEqual({
      ok: true,
      method: "POST",
    });
  });

  it("rejects unknown methods and disallowed paths", () => {
    expect(checkToolCall({ method: "OPTIONS", path: "/api/admin/faqs", mode: "act" }).ok).toBe(false);
    expect(checkToolCall({ method: "GET", path: "/api/admin/assistant", mode: "act" }).ok).toBe(false);
  });
});
