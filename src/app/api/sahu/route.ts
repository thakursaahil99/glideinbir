import { NextRequest } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/server/auth/guards";
import { withErrorHandling, apiSuccess } from "@/server/lib/api-response";
import { RateLimitedError, ValidationError } from "@/server/lib/errors";
import { checkRateLimit, getClientIp } from "@/server/lib/rate-limit";
import { runSahuBhai } from "@/server/modules/assistant/agent";
import { getOrCreateSession, needsEmail, recordTurn } from "@/server/modules/assistant/store";

export const maxDuration = 60;

const MAX_MESSAGE_CHARS = 8_000;
const MAX_HISTORY = 12;

const bodySchema = z.object({
  lang: z.enum(["en", "hi"]).default("en"),
  messages: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string() }))
    .min(1)
    .max(100),
});

// Public site assistant — no admin access, no tools. Free for the first few
// messages, then an email is required (see /api/sahu/email).
export const POST = withErrorHandling(async (request: NextRequest) => {
  const ip = getClientIp(request);
  if (!checkRateLimit(`sahu-public:${ip}`, 15, 5 * 60 * 1000)) {
    throw new RateLimitedError("Too many requests — please wait a moment and try again.");
  }

  const { messages, lang } = bodySchema.parse(await request.json());
  const user = await getCurrentUser();
  const session = await getOrCreateSession({
    user: user ? { id: user.id, email: user.email } : null,
    origin: "public",
    ip,
    userAgent: request.headers.get("user-agent"),
  });

  if (needsEmail(session, user)) {
    return apiSuccess({ needsEmail: true, reply: null });
  }

  const history = messages
    .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_MESSAGE_CHARS) }))
    .filter((m) => m.content.trim().length > 0)
    .slice(-MAX_HISTORY);
  if (history.length === 0) {
    throw new ValidationError("Say something for Sahu Bhai to respond to.");
  }

  const result = await runSahuBhai({
    history,
    tools: "none",
    lang,
    mode: "readonly",
    origin: new URL(request.url).origin,
    cookie: "",
    user: null,
  });

  const lastUser = [...history].reverse().find((m) => m.role === "user");
  await recordTurn({
    sessionId: session.id,
    userText: lastUser?.content ?? "",
    assistantText: result.reply,
  });

  return apiSuccess({ needsEmail: false, reply: result.reply });
});
