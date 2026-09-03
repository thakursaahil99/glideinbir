// Pure, dependency-free guardrails for what Sahu Bhai's single `admin_api`
// tool is allowed to do. Kept separate from the execution code so it can be
// unit-tested in isolation (see authorize.test.ts).

export type AssistantMode = "readonly" | "act";
export type ToolMethod = "GET" | "POST" | "PATCH" | "DELETE";

const METHODS: ToolMethod[] = ["GET", "POST", "PATCH", "DELETE"];
const WRITE_METHODS: ToolMethod[] = ["POST", "PATCH", "DELETE"];

// Sahu Bhai may only touch the admin REST API, and never its own endpoint
// (which would let it recurse). Everything under /api/admin/** already
// enforces its own RBAC + validation + audit logging, so the allowlist only
// has to keep the model on that surface.
export function isAllowedAdminPath(rawPath: unknown): boolean {
  if (typeof rawPath !== "string") return false;
  const path = rawPath.trim();
  if (!path.startsWith("/")) return false;

  // Structural check ignores any query string / hash.
  const clean = path.split(/[?#]/)[0] ?? "";
  if (clean.includes("..") || clean.includes("//")) return false;
  if (!/^\/api\/admin\/[A-Za-z0-9\-_/]+$/.test(clean)) return false;
  if (clean === "/api/admin/assistant" || clean.startsWith("/api/admin/assistant/")) {
    return false;
  }
  return true;
}

export function checkToolCall(input: {
  method: unknown;
  path: unknown;
  mode: AssistantMode;
}): { ok: true; method: ToolMethod } | { ok: false; reason: string } {
  const method = String(input.method ?? "").toUpperCase() as ToolMethod;
  if (!METHODS.includes(method)) {
    return {
      ok: false,
      reason: `Unsupported method "${String(input.method)}". Use GET, POST, PATCH or DELETE.`,
    };
  }
  if (!isAllowedAdminPath(input.path)) {
    return {
      ok: false,
      reason: `Path "${String(input.path)}" is not allowed. Only paths under "/api/admin/" (and not the assistant itself) can be called.`,
    };
  }
  if (input.mode === "readonly" && WRITE_METHODS.includes(method)) {
    return {
      ok: false,
      reason: `You are in "Read-only" mode, so ${method} is blocked. Tell the user to switch to "Make changes" mode if they want this change made.`,
    };
  }
  return { ok: true, method };
}
