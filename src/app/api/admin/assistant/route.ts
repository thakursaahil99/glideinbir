import { NextRequest } from "next/server";
import { z } from "zod";
import { requireRole } from "@/server/auth/guards";
import { withErrorHandling, apiSuccess } from "@/server/lib/api-response";
import { RateLimitedError, ValidationError } from "@/server/lib/errors";
import { checkRateLimit, getClientIp } from "@/server/lib/rate-limit";
import { ADMIN_ROLES } from "@/lib/admin-roles";
import { runSahuBhai } from "@/server/modules/assistant/agent";
import { isSahuBhaiConfigured } from "@/server/modules/assistant/client";
import { getOrCreateSession, recordTurn } from "@/server/modules/assistant/store";

// The agent loop can make several LLM round-trips; give it room (Vercel
// caps this at 60s on Hobby, 300s on Pro).
export const maxDuration = 60;

// Kept lenient on purpose: an assistant turn (a long code answer, say) can
// be huge, and it comes straight back in the next request's history — a
// strict per-message cap here would 400 the whole conversation once that
// happens. We accept it and trim in the handler instead.
const bodySchema = z.object({
  mode: z.enum(["readonly", "act"]).default("readonly"),
  lang: z.enum(["en", "hi"]).default("en"),
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string(),
      }),
    )
    .min(1)
    .max(100),
});

// Keep the slice we send to the model modest so a long chat stays under
// free-tier token-per-minute limits. The client still keeps/shows the full
// history locally; the model only needs recent context.
const MAX_MESSAGE_CHARS = 8_000;
const MAX_HISTORY = 12;

export const POST = withErrorHandling(async (request: NextRequest) => {
  const user = await requireRole(...ADMIN_ROLES);

  // Generous — just a runaway-loop guard, not a real usage cap.
  if (!checkRateLimit(`sahu-bhai:${user.id}`, 120, 60_000)) {
    throw new RateLimitedError("Sahu Bhai needs a breather — try again in a minute.");
  }

  const { mode, lang, messages } = bodySchema.parse(await request.json());

  // Drop empty turns, cap each turn's length, keep the most recent slice.
  const history = messages
    .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_MESSAGE_CHARS) }))
    .filter((m) => m.content.trim().length > 0)
    .slice(-MAX_HISTORY);
  if (history.length === 0) {
    throw new ValidationError("Say something for Sahu Bhai to respond to.");
  }

  const result = await runSahuBhai({
    history,
    // Only SUPER_ADMIN can drive admin changes through the AI; every other
    // role gets a chat-only assistant.
    tools: user.role === "SUPER_ADMIN" ? "admin" : "none",
    lang,
    mode,
    origin: new URL(request.url).origin,
    cookie: request.headers.get("cookie") ?? "",
    user: { name: user.name, role: user.role },
  });

  // Log the turn so it shows in /admin/sahu-chats (best-effort).
  try {
    const session = await getOrCreateSession({
      user: { id: user.id, email: user.email },
      origin: "admin",
      ip: getClientIp(request),
      userAgent: request.headers.get("user-agent"),
    });
    const lastUser = [...history].reverse().find((m) => m.role === "user");
    await recordTurn({
      sessionId: session.id,
      userText: lastUser?.content ?? "",
      assistantText: result.reply,
      actions: result.actions,
    });
  } catch {
    /* history logging must never break the reply */
  }

  return apiSuccess({ ...result, configured: isSahuBhaiConfigured() });
});
