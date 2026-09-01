import { NextRequest } from "next/server";
import { randomBytes } from "node:crypto";
import { z } from "zod";
import { prisma } from "@/server/db/prisma";
import { hashToken } from "@/server/auth/session";
import { withErrorHandling, apiSuccess } from "@/server/lib/api-response";
import { RateLimitedError } from "@/server/lib/errors";
import { checkRateLimit, getClientIp } from "@/server/lib/rate-limit";
import { env } from "@/config/env";
import { notificationService } from "@/server/modules/notification/service";
import { passwordResetEmail } from "@/server/modules/notification/templates";

const forgotPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
});

const RESET_TOKEN_TTL_MS = 30 * 60 * 1000; // 30 minutes

export const POST = withErrorHandling(async (request: NextRequest) => {
  const ip = getClientIp(request);
  if (!checkRateLimit(`forgot-password:${ip}`, 5, 15 * 60 * 1000)) {
    throw new RateLimitedError("Too many reset requests — please try again in a few minutes.");
  }

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

    const resetUrl = `${env.NEXT_PUBLIC_SITE_URL}/reset-password?token=${token}`;
    const { subject, html } = passwordResetEmail({ name: user.name, resetUrl });
    await notificationService.sendEmail({
      userId: user.id,
      type: "PASSWORD_RESET",
      recipient: user.email,
      subject,
      html,
    });
  }

  return apiSuccess({ message: "If that email is registered, a reset link has been sent." });
});
