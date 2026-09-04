import { NextRequest } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/server/auth/guards";
import { prisma } from "@/server/db/prisma";
import { withErrorHandling, apiSuccess } from "@/server/lib/api-response";
import { checkRateLimit, getClientIp } from "@/server/lib/rate-limit";
import { RateLimitedError } from "@/server/lib/errors";
import { env } from "@/config/env";
import { notificationService } from "@/server/modules/notification/service";
import { getOrCreateSession, setSessionEmail } from "@/server/modules/assistant/store";

const bodySchema = z.object({ email: z.string().trim().toLowerCase().email() });

// Records the visitor's email so the public assistant stops gating them,
// and pings the Super Admin that a new lead came in.
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

  const { isNew } = await setSessionEmail(session.id, email);

  if (isNew && !user) {
    const admin = await prisma.user.findFirst({
      where: { role: "SUPER_ADMIN", isActive: true },
      select: { id: true, email: true },
    });
    if (admin) {
      const link = `${env.NEXT_PUBLIC_SITE_URL}/admin/sahu-chats`;
      void notificationService.sendEmail({
        userId: admin.id,
        type: "SAHU_LEAD",
        recipient: admin.email,
        subject: `New Sahu Bhai lead: ${email}`,
        html: `<p>A visitor left their email while chatting with Sahu Bhai.</p>
<p><strong>${email}</strong></p>
<p><a href="${link}">Open the conversation in the admin</a></p>`,
      });
    }
  }

  return apiSuccess({ ok: true });
});
