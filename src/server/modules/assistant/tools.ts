import { logger } from "@/server/lib/logger";
import { checkToolCall, type AssistantMode } from "./authorize";
import type { ChatTool } from "./client";

export const ADMIN_API_TOOL: ChatTool = {
  type: "function",
  function: {
    name: "admin_api",
    description:
      "Call the Glideinbir admin REST API as the signed-in admin. GET to look things up (always before changing anything), POST to create, PATCH to update, DELETE to remove. Only paths under /api/admin/ are allowed.",
    parameters: {
      type: "object",
      properties: {
        method: { type: "string", enum: ["GET", "POST", "PATCH", "DELETE"] },
        path: {
          type: "string",
          description:
            'Admin API path starting with "/api/admin/", e.g. "/api/admin/faqs" or "/api/admin/faqs/abc123". A query string is allowed on GET.',
        },
        body: {
          type: "object",
          description: "JSON body for POST / PATCH. Omit for GET / DELETE.",
          additionalProperties: true,
        },
      },
      required: ["method", "path"],
      additionalProperties: false,
    },
  },
};

export type ActionLog = { method: string; path: string; status: number; ok: boolean };

// Executes one admin_api tool call by re-issuing it against this same server
// with the caller's session cookie, so the real route handler does the RBAC,
// validation and audit logging. Returns a JSON string for the model plus an
// action-log entry for the UI (null when the call was rejected before hitting
// the network).
export async function executeAdminApi(args: {
  raw: unknown;
  mode: AssistantMode;
  origin: string;
  cookie: string;
  /** Concatenated text of every earlier tool result this turn — used to
   *  catch the model inventing an id it never actually looked up. */
  priorResults: string;
}): Promise<{ result: string; action: ActionLog | null }> {
  const input = (args.raw && typeof args.raw === "object" ? args.raw : {}) as {
    method?: unknown;
    path?: unknown;
    body?: unknown;
  };

  const check = checkToolCall({ method: input.method, path: input.path, mode: args.mode });
  if (!check.ok) {
    return { result: JSON.stringify({ error: check.reason }), action: null };
  }

  const { method } = check;
  const path = String(input.path).trim();

  // Small models love to guess "abc123" instead of GETting the real record.
  // For a targeted PATCH/DELETE, require that the id segment actually showed
  // up in an earlier result.
  if (method === "PATCH" || method === "DELETE") {
    const segments = path.split(/[?#]/)[0]!.split("/").filter(Boolean);
    const idSegment = segments[3]; // /api/admin/<resource>/<id>
    if (idSegment && !args.priorResults.includes(idSegment)) {
      return {
        result: JSON.stringify({
          error: `Refusing ${method} ${path} — the id "${idSegment}" never appeared in an earlier GET result. GET the list endpoint first and use a real id; do not guess.`,
        }),
        action: null,
      };
    }
  }

  const hasBody = method === "POST" || method === "PATCH";

  let res: Response;
  try {
    res = await fetch(`${args.origin}${path}`, {
      method,
      headers: {
        ...(hasBody ? { "content-type": "application/json" } : {}),
        cookie: args.cookie,
      },
      body: hasBody ? JSON.stringify(input.body ?? {}) : undefined,
      redirect: "manual",
    });
  } catch (error) {
    logger.error("Sahu Bhai admin_api fetch failed", { path, error: String(error) });
    return { result: JSON.stringify({ error: `Request to ${path} failed.` }), action: null };
  }

  const text = await res.text();
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    data = text.slice(0, 2000);
  }

  let result = JSON.stringify({ status: res.status, ok: res.ok, data: trim(data) });
  // Hard ceiling on a single tool result — a huge one repeated across agent
  // iterations is what blows the free-tier token-per-minute budget.
  if (result.length > 6000) result = `${result.slice(0, 6000)}… (truncated)`;

  return {
    result,
    action: { method, path, status: res.status, ok: res.ok },
  };
}

// Keep tool-result payloads small so long list endpoints don't blow up the
// model's context window (and the per-minute token limit).
function trim(value: unknown): unknown {
  if (Array.isArray(value)) {
    const capped: unknown[] = value.slice(0, 25).map(trim);
    if (value.length > 25) capped.push(`…and ${value.length - 25} more items`);
    return capped;
  }
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([k, v]) => [k, trim(v)]),
    );
  }
  if (typeof value === "string" && value.length > 800) return `${value.slice(0, 800)}…`;
  return value;
}
