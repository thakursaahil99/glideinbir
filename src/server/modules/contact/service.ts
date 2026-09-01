import type { z } from "zod";
import { prisma } from "@/server/db/prisma";
import { NotFoundError } from "@/server/lib/errors";
import { notificationService } from "@/server/modules/notification/service";
import { contactAdminNotificationEmail, contactAutoReplyEmail } from "@/server/modules/notification/templates";
import type { contactMessageInputSchema } from "./validation";

type ContactMessageInput = z.infer<typeof contactMessageInputSchema>;

export const contactService = {
  list: () => prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" } }),

  async create(input: ContactMessageInput) {
    const message = await prisma.contactMessage.create({ data: input });

    // Notify whoever is Super Admin right now (not a fixed env var — stays
    // correct if the admin account/email ever changes) and auto-reply to
    // the sender. Both are best-effort — notificationService never throws.
    const admin = await prisma.user.findFirst({ where: { role: "SUPER_ADMIN", isActive: true } });
    if (admin) {
      const { subject, html } = contactAdminNotificationEmail(input);
      void notificationService.sendEmail({
        userId: admin.id,
        type: "CONTACT_MESSAGE",
        recipient: admin.email,
        subject,
        html,
      });
    }

    const { subject, html } = contactAutoReplyEmail({ name: input.name });
    void notificationService.sendEmail({
      type: "CONTACT_AUTO_REPLY",
      recipient: input.email,
      subject,
      html,
    });

    return message;
  },

  async markRead(id: string, isRead: boolean) {
    const existing = await prisma.contactMessage.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError("Message not found");
    return prisma.contactMessage.update({ where: { id }, data: { isRead } });
  },
};
