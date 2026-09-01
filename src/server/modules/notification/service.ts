// Every outbound email goes through here: a Notification row is written
// first (PENDING), then the send is attempted and the row is updated to
// SENT or FAILED. This is the "Notification service's email channel" the
// old TODOs in the auth/payment modules referred to — WHATSAPP/SMS/PUSH
// are already valid values on the same enum for later, no schema change
// needed.
//
// Without a RESEND_API_KEY configured (local dev, or before the real key
// is added), sends are logged and recorded as FAILED instead of thrown —
// nothing in the calling flow (password reset, booking confirmation,
// contact form) should ever break because email isn't configured yet.

import { Resend } from "resend";
import { prisma } from "@/server/db/prisma";
import { env } from "@/config/env";
import { logger } from "@/server/lib/logger";
import type { NotificationChannel } from "@prisma/client";

let resendClient: Resend | null | undefined;

function getResendClient(): Resend | null {
  if (resendClient !== undefined) return resendClient;
  resendClient = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;
  return resendClient;
}

export const notificationService = {
  // Fire-and-forget from the caller's perspective — never throws, so a
  // notification failure can't fail the booking/reset/contact flow that
  // triggered it.
  async sendEmail(params: {
    userId?: string;
    type: string;
    recipient: string;
    subject: string;
    html: string;
    text?: string;
  }): Promise<void> {
    const notification = await prisma.notification.create({
      data: {
        userId: params.userId,
        type: params.type,
        channel: "EMAIL" as NotificationChannel,
        recipient: params.recipient,
        subject: params.subject,
        body: params.html,
        status: "PENDING",
      },
    });

    const client = getResendClient();
    if (!client) {
      logger.warn("Email not sent — RESEND_API_KEY is not configured", {
        type: params.type,
        recipient: params.recipient,
        notificationId: notification.id,
      });
      await prisma.notification.update({ where: { id: notification.id }, data: { status: "FAILED" } });
      return;
    }

    try {
      const result = await client.emails.send({
        from: env.EMAIL_FROM,
        to: params.recipient,
        subject: params.subject,
        html: params.html,
        text: params.text,
      });
      if (result.error) throw new Error(result.error.message);
      await prisma.notification.update({
        where: { id: notification.id },
        data: { status: "SENT", sentAt: new Date() },
      });
    } catch (err) {
      logger.error("Failed to send email", {
        type: params.type,
        recipient: params.recipient,
        notificationId: notification.id,
        error: err instanceof Error ? err.message : String(err),
      });
      await prisma.notification.update({ where: { id: notification.id }, data: { status: "FAILED" } });
    }
  },
};
