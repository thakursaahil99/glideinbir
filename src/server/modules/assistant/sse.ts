import { NextResponse } from "next/server";
import { logger } from "@/server/lib/logger";
import { RateLimitedError } from "@/server/lib/errors";
import type { SahuBhaiResult } from "./agent";
import type { ActionLog } from "./tools";

export type SseEmit = {
  text: (delta: string) => void;
  action: (action: ActionLog) => void;
};

// Runs `work` and streams its output as Server-Sent Events:
//   event: text   data: { delta }
//   event: action data: { method, path, status, ok }
//   event: done   data: { actions, truncated, ...extra }
//   event: error  data: { message }
// Pre-stream failures (auth, rate limit, the email gate) should be handled
// by the caller *before* calling this. Sends become no-ops once the client
// disconnects, and `after` still runs so the turn is logged either way.
export function sseResponse(
  work: (emit: SseEmit) => Promise<SahuBhaiResult>,
  opts?: {
    extraDone?: Record<string, unknown>;
    after?: (result: SahuBhaiResult) => Promise<void> | void;
  },
): NextResponse {
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let open = true;
      const send = (event: string, data: unknown) => {
        if (!open) return;
        try {
          controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
        } catch {
          open = false;
        }
      };

      let result: SahuBhaiResult | null = null;
      try {
        result = await work({
          text: (delta) => send("text", { delta }),
          action: (action) => send("action", action),
        });
        send("done", {
          actions: result.actions,
          truncated: result.truncated,
          ...(opts?.extraDone ?? {}),
        });
      } catch (err) {
        logger.error("Sahu Bhai stream failed", { error: String(err) });
        const message =
          err && typeof err === "object" && "message" in err
            ? String((err as { message: unknown }).message)
            : "Something went wrong.";
        send("error", {
          message,
          rateLimited: err instanceof RateLimitedError,
        });
      }

      // Persist BEFORE closing — on serverless the function can be frozen
      // the moment the response stream ends.
      if (result && opts?.after) {
        try {
          await opts.after(result);
        } catch (err) {
          logger.error("Sahu Bhai stream after-hook failed", { error: String(err) });
        }
      }

      open = false;
      try {
        controller.close();
      } catch {
        /* already closed by a client disconnect */
      }
    },
  });

  return new NextResponse(stream, {
    headers: {
      "content-type": "text/event-stream; charset=utf-8",
      "cache-control": "no-cache, no-transform",
      "x-accel-buffering": "no",
    },
  });
}
