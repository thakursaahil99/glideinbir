import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/server/db/prisma";
import { hashPassword } from "@/server/auth/password";
import { createSession, setSessionCookie } from "@/server/auth/session";
import { withErrorHandling, apiSuccess } from "@/server/lib/api-response";
import { ConflictError } from "@/server/lib/errors";

const registerSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().toLowerCase().email(),
  phone: z.string().trim().min(6).max(20).optional(),
  password: z.string().min(8).max(72),
});

export const POST = withErrorHandling(async (request: NextRequest) => {
  const { name, email, phone, password } = registerSchema.parse(await request.json());

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new ConflictError("An account with this email already exists");

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: { name, email, phone, passwordHash },
  });

  const { token, expiresAt } = await createSession(user.id, {
    userAgent: request.headers.get("user-agent") ?? undefined,
    ipAddress: request.headers.get("x-forwarded-for") ?? undefined,
  });
  await setSessionCookie(token, expiresAt);

  const { passwordHash: _passwordHash, ...safeUser } = user;
  return apiSuccess(safeUser, 201);
});
