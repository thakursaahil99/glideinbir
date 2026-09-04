import { NextResponse } from "next/server";
import { requireRole } from "@/server/auth/guards";
import { prisma } from "@/server/db/prisma";
import { withErrorHandling } from "@/server/lib/api-response";

function csvCell(value: unknown): string {
  const s = value == null ? "" : String(value);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

// CSV of public leads (sessions that left an email). Super Admin only.
export const GET = withErrorHandling(async () => {
  await requireRole("SUPER_ADMIN");

  const sessions = await prisma.sahuChatSession.findMany({
    where: { origin: "public", email: { not: null } },
    orderBy: { createdAt: "desc" },
    select: {
      email: true,
      messageCount: true,
      createdAt: true,
      lastMessageAt: true,
      _count: { select: { messages: true } },
    },
  });

  const header = ["email", "first_seen", "last_active", "user_messages", "total_messages"];
  const lines = sessions.map((s) =>
    [
      s.email,
      s.createdAt.toISOString(),
      s.lastMessageAt.toISOString(),
      s.messageCount,
      s._count.messages,
    ]
      .map(csvCell)
      .join(","),
  );
  const csv = [header.join(","), ...lines].join("\n");

  return new NextResponse(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="sahu-bhai-leads-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
});
