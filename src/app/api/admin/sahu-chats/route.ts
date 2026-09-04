import { requireRole } from "@/server/auth/guards";
import { prisma } from "@/server/db/prisma";
import { withErrorHandling, apiSuccess } from "@/server/lib/api-response";

const DAY = 24 * 60 * 60 * 1000;
const dayKey = (d: Date) => d.toISOString().slice(0, 10);

// Every Sahu Bhai conversation (public + admin) + a stats / analytics
// summary. Super Admin only.
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

  const weekAgo = Date.now() - 7 * DAY;
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

  // New conversations per day (UTC), last 14 days.
  const since = new Date();
  since.setUTCHours(0, 0, 0, 0);
  since.setUTCDate(since.getUTCDate() - 13);
  const recent = await prisma.sahuChatSession.findMany({
    where: { createdAt: { gte: since } },
    select: { createdAt: true },
  });
  const counts = new Map<string, number>();
  for (const r of recent) counts.set(dayKey(r.createdAt), (counts.get(dayKey(r.createdAt)) ?? 0) + 1);
  const daily = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(since.getTime() + i * DAY);
    return { date: dayKey(d), count: counts.get(dayKey(d)) ?? 0 };
  });

  // What people ask — first user message of each recent public conversation.
  const userMsgs = await prisma.sahuChatMessage.findMany({
    where: { role: "user", session: { origin: "public" } },
    orderBy: { createdAt: "asc" },
    select: { sessionId: true, content: true },
    take: 800,
  });
  const firstBySession = new Map<string, string>();
  for (const m of userMsgs) if (!firstBySession.has(m.sessionId)) firstBySession.set(m.sessionId, m.content);
  const tally = new Map<string, { text: string; count: number }>();
  for (const text of firstBySession.values()) {
    const norm = text.trim().toLowerCase().replace(/\s+/g, " ").slice(0, 120);
    if (!norm) continue;
    const hit = tally.get(norm) ?? { text: text.trim().slice(0, 120), count: 0 };
    hit.count += 1;
    tally.set(norm, hit);
  }
  const topQuestions = [...tally.values()].sort((a, b) => b.count - a.count).slice(0, 10);

  return apiSuccess({ sessions: rows, stats, daily, topQuestions });
});
