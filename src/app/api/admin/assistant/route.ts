import { NextRequest } from "next/server";
import { z } from "zod";
import { requireRole } from "@/server/auth/guards";
import { withErrorHandling, apiSuccess } from "@/server/lib/api-response";
import { RateLimitedError } from "@/server/lib/errors";
import { checkRateLimit } from "@/server/lib/rate-limit";
import { ADMIN_ROLES } from "@/lib/admin-roles";
import { runSahuBhai } from "@/server/modules/assistant/agent";
import { isSahuBhaiConfigured } from "@/server/modules/assistant/client";

const bodySchema = z.object({
  mode: z.enum(["readonly", "act"]).default("readonly"),
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().trim().min(1).max(4000),
      }),
    )
    .min(1)
    .max(40),
});

export const POST = withErrorHandling(async (request: NextRequest) => {
  const user = await requireRole(...ADMIN_ROLES);

  if (!checkRateLimit(`sahu-bhai:${user.id}`, 20, 60_000)) {
    throw new RateLimitedError("Sahu Bhai needs a breather — try again in a minute.");
  }

  const { mode, messages } = bodySchema.parse(await request.json());

  const result = await runSahuBhai({
    history: messages,
    mode,
    origin: new URL(request.url).origin,
    cookie: request.headers.get("cookie") ?? "",
    user: { name: user.name, role: user.role },
  });

  return apiSuccess({ ...result, configured: isSahuBhaiConfigured() });
});
