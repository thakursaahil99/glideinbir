import { requireRole } from "@/server/auth/guards";
import { prisma } from "@/server/db/prisma";
import { withErrorHandling, apiSuccess } from "@/server/lib/api-response";

// Every Sahu Bhai conversation (public + admin), newest first. Super Admin only.
export const GET = withErrorHandling(async () => {
  await requireRole("SUPER_ADMIN");

  const sessions = await prisma.sahuChatSession.findMany({
    orderBy: { lastMessageAt: "desc" },
    take: 300,
    select: {
      id: true,
      email: true,
      origin: true,
      messageCount: true,
      createdAt: true,
      lastMessageAt: true,
      user: { select: { name: true } },
      _count: { select: { messages: true } },
    },
  });

  return apiSuccess(
    sessions.map((s) => ({
      id: s.id,
      email: s.email,
      userName: s.user?.name ?? null,
      origin: s.origin,
      turns: s.messageCount,
      totalMessages: s._count.messages,
      createdAt: s.createdAt,
      lastMessageAt: s.lastMessageAt,
    })),
  );
});
