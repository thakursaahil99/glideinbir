import { NextRequest } from "next/server";
import { randomBytes } from "node:crypto";
import { z } from "zod";
import { prisma } from "@/server/db/prisma";
import { hashToken } from "@/server/auth/session";
import { withErrorHandling, apiSuccess } from "@/server/lib/api-response";
import { logger } from "@/server/lib/logger";
import { env } from "@/config/env";

const forgotPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
});

const RESET_TOKEN_TTL_MS = 30 * 60 * 1000; // 30 minutes

export const POST = withErrorHandling(async (request: NextRequest) => {
  const { email } = forgotPasswordSchema.parse(await request.json());

  const user = await prisma.user.findUnique({ where: { email } });
  // Same response whether or not the account exists — this endpoint must
  // not be usable to enumerate registered emails.
  if (user && user.isActive) {
    const token = randomBytes(32).toString("hex");
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash: hashToken(token),
        expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
      },
    });

    // TODO(Phase 8): dispatch through the Notification service's email
    // channel instead of logging, once that module exists.
    logger.info("Password reset link generated", {
      userId: user.id,
      resetUrl: `${env.NEXT_PUBLIC_SITE_URL}/reset-password?token=${token}`,
    });
  }

  return apiSuccess({ message: "If that email is registered, a reset link has been sent." });
});
