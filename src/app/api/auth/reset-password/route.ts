import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/server/db/prisma";
import { hashToken, destroyAllSessionsForUser } from "@/server/auth/session";
import { hashPassword } from "@/server/auth/password";
import { withErrorHandling, apiSuccess } from "@/server/lib/api-response";
import { UnauthorizedError } from "@/server/lib/errors";

const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8).max(72),
});

export const POST = withErrorHandling(async (request: NextRequest) => {
  const { token, password } = resetPasswordSchema.parse(await request.json());

  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { tokenHash: hashToken(token) },
  });

  if (!resetToken || resetToken.usedAt || resetToken.expiresAt < new Date()) {
    throw new UnauthorizedError("This reset link is invalid or has expired");
  }

  const passwordHash = await hashPassword(password);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: resetToken.userId },
      data: { passwordHash },
    }),
    prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { usedAt: new Date() },
    }),
  ]);

  // Consuming a reset token revokes every existing session (ARCHITECTURE.md
  // section 7) — a stolen session shouldn't survive a password reset.
  await destroyAllSessionsForUser(resetToken.userId);

  return apiSuccess({ message: "Password updated. Please log in again." });
});
