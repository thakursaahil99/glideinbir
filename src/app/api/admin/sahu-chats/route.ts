import { requireRole } from "@/server/auth/guards";
import { prisma } from "@/server/db/prisma";
import { withErrorHandling, apiSuccess } from "@/server/lib/api-response";

// Every Sahu Bhai conversation (public + admin) + a small stats summary.
// Super Admin only.
export const GET = withErrorHandling(async () => {
  await requireRole("SUPER_ADMIN");

  const sessions = await prisma.sahuChatSession.findMany({
    orderBy: { lastMessageAt: "desc" },
    take: 400,
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

  // Which of the captured emails belong to a registered user (a real lead
  // that's already in the system).
  const emails = [...new Set(sessions.map((s) => s.email).filter((e): e is string => !!e))];
  const known = emails.length
    ? new Set(
        (
          await prisma.user.findMany({
            where: { email: { in: emails } },
            select: { email: true },
          })
        ).map((u) => u.email),
      )
    : new Set<string>();

  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const rows = sessions.map((s) => ({
    id: s.id,
    email: s.email,
    userName: s.user?.name ?? null,
    isCustomer: s.email ? known.has(s.email) : false,
    origin: s.origin,
    turns: s.messageCount,
    totalMessages: s._count.messages,
    createdAt: s.createdAt,
    lastMessageAt: s.lastMessageAt,
  }));

  const stats = {
    total: rows.length,
    thisWeek: rows.filter((r) => new Date(r.lastMessageAt).getTime() >= weekAgo).length,
    leads: rows.filter((r) => r.origin === "public" && r.email).length,
    uniqueEmails: emails.length,
    fromPublic: rows.filter((r) => r.origin === "public").length,
    fromAdmin: rows.filter((r) => r.origin === "admin").length,
  };

  return apiSuccess({ sessions: rows, stats });
});
