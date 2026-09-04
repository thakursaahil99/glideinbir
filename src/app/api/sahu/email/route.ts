import { NextRequest } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/server/auth/guards";
import { withErrorHandling, apiSuccess } from "@/server/lib/api-response";
import { checkRateLimit, getClientIp } from "@/server/lib/rate-limit";
import { RateLimitedError } from "@/server/lib/errors";
import { getOrCreateSession, setSessionEmail } from "@/server/modules/assistant/store";

const bodySchema = z.object({ email: z.string().trim().toLowerCase().email() });

// Records the visitor's email so the public assistant stops gating them.
export const POST = withErrorHandling(async (request: NextRequest) => {
  const ip = getClientIp(request);
  if (!checkRateLimit(`sahu-email:${ip}`, 10, 10 * 60 * 1000)) {
    throw new RateLimitedError("Too many attempts — try again in a few minutes.");
  }

  const { email } = bodySchema.parse(await request.json());
  const user = await getCurrentUser();
  const session = await getOrCreateSession({
    user: user ? { id: user.id, email: user.email } : null,
    origin: "public",
    ip,
    userAgent: request.headers.get("user-agent"),
  });

  await setSessionEmail(session.id, email);
  return apiSuccess({ ok: true });
});
