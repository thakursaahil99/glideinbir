import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/server/db/prisma";
import { verifyPassword } from "@/server/auth/password";
import { createSession, setSessionCookie } from "@/server/auth/session";
import { withErrorHandling, apiSuccess } from "@/server/lib/api-response";
import { UnauthorizedError } from "@/server/lib/errors";

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
});

export const POST = withErrorHandling(async (request: NextRequest) => {
  const { email, password } = loginSchema.parse(await request.json());

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
