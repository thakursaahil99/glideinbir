import { NextRequest } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/server/auth/guards";
import { withErrorHandling } from "@/server/lib/api-response";
import { RateLimitedError, ValidationError } from "@/server/lib/errors";
import { checkRateLimit, getClientIp } from "@/server/lib/rate-limit";
import { runSahuBhai } from "@/server/modules/assistant/agent";
import { sseResponse } from "@/server/modules/assistant/sse";
import {
  bumpPublicDailyCount,
  getOrCreateSession,
  needsEmail,
  recordTurn,
} from "@/server/modules/assistant/store";

export const maxDuration = 60;

const MAX_MESSAGE_CHARS = 8_000;
const MAX_HISTORY = 12;

const bodySchema = z.object({
  lang: z.enum(["en", "hi"]).default("en"),
  newChat: z.boolean().optional(),
  messages: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string() }))
    .min(1)
    .max(100),
});

// Public site assistant — read-only `site_api` tool, no admin access.
// Streams the reply as SSE. Free for the first few messages, then an email
// is required (see /api/sahu/email).
export const POST = withErrorHandling(async (request: NextRequest) => {
  const ip = getClientIp(request);
  if (!checkRateLimit(`sahu-public:${ip}`, 15, 5 * 60 * 1000)) {
    throw new RateLimitedError("Too many requests — please wait a moment and try again.");
  }

  const { messages, lang, newChat } = bodySchema.parse(await request.json());
  const user = await getCurrentUser();
  const session = await getOrCreateSession({
    user: user ? { id: user.id, email: user.email } : null,
    origin: "public",
    ip,
    userAgent: request.headers.get("user-agent"),
    forceNew: newChat,
  });

  if (needsEmail(session, user)) {
    return sseResponse(async () => ({ reply: "", actions: [], truncated: false }), {
      extraDone: { needsEmail: true },
    });
  }

  if (!user && !(await bumpPublicDailyCount()).allowed) {
    throw new RateLimitedError(
      "Sahu Bhai has hit today's free usage limit. Please try again tomorrow, or reach us on WhatsApp.",
    );
  }

  const history = messages
    .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_MESSAGE_CHARS) }))
    .filter((m) => m.content.trim().length > 0)
    .slice(-MAX_HISTORY);
  if (history.length === 0) {
    throw new ValidationError("Say something for Sahu Bhai to respond to.");
  }

  const origin = new URL(request.url).origin;
  const lastUser = [...history].reverse().find((m) => m.role === "user");

  return sseResponse(
    (emit) =>
      runSahuBhai({
        history,
        tools: "site",
        lang,
        mode: "readonly",
        origin,
        cookie: "",
        user: null,
        onText: emit.text,
        onAction: emit.action,
      }),
    {
      extraDone: { needsEmail: false },
      after: (result) =>
        recordTurn({
          sessionId: session.id,
          userText: lastUser?.content ?? "",
          assistantText: result.reply,
          actions: result.actions,
        }),
    },
  );
});
