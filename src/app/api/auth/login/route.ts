import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/server/db/prisma";
import { verifyPassword } from "@/server/auth/password";
import { createSession, setSessionCookie } from "@/server/auth/session";
import { withErrorHandling, apiSuccess } from "@/server/lib/api-response";
import { UnauthorizedError, RateLimitedError } from "@/server/lib/errors";
import { checkRateLimit, getClientIp } from "@/server/lib/rate-limit";

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
});

export const POST = withErrorHandling(async (request: NextRequest) => {
  const { email, password } = loginSchema.parse(await request.json());

  // Keyed by IP+email so one bad actor can't lock out other users sharing
  // an IP (office wifi, campus NAT), while still slowing down a targeted
  // credential-stuffing attempt against one account.
  const ip = getClientIp(request);
  if (!checkRateLimit(`login:${ip}:${email}`, 10, 15 * 60 * 1000)) {
    throw new RateLimitedError("Too many login attempts — please try again in a few minutes.");
  }

  const user = await prisma.user.findUnique({ where: { email } });
  // Same error for "no such user" and "wrong password" — don't leak which
  // one it was.
  if (!user || !user.isActive || !(await verifyPassword(password, user.passwordHash))) {
    throw new UnauthorizedError("Invalid email or password");
  }

  const { token, expiresAt } = await createSession(user.id, {
    userAgent: request.headers.get("user-agent") ?? undefined,
    ipAddress: request.headers.get("x-forwarded-for") ?? undefined,
  });
  await setSessionCookie(token, expiresAt);

  const { passwordHash: _passwordHash, ...safeUser } = user;
  return apiSuccess(safeUser);
});
