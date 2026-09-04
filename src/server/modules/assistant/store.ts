import { createHash } from "node:crypto";
import { cookies } from "next/headers";
import type { SahuChatSession, User } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import { env } from "@/config/env";
import type { ActionLog } from "./tools";

const SID_COOKIE = "sahu_sid";
const SID_TTL_MS = 180 * 24 * 60 * 60 * 1000; // 180 days
const FREE_MESSAGES = 4;

function hashIp(ip: string): string {
  return createHash("sha256").update(`${env.SESSION_SECRET}:${ip}`).digest("hex").slice(0, 32);
}

// Reads the sahu_sid cookie and loads (or creates) the chat session row.
// Stamps userId/email/origin from a logged-in admin when present.
export async function getOrCreateSession(params: {
  user: Pick<User, "id" | "email"> | null;
  origin: "public" | "admin";
  ip?: string;
  userAgent?: string | null;
}): Promise<SahuChatSession> {
  const store = await cookies();
  const existingId = store.get(SID_COOKIE)?.value;

  let session = existingId
    ? await prisma.sahuChatSession.findUnique({ where: { id: existingId } })
    : null;

  if (session) {
    // Backfill identity if the visitor has since logged in.
    if (params.user && (!session.userId || !session.email)) {
      session = await prisma.sahuChatSession.update({
        where: { id: session.id },
        data: { userId: params.user.id, email: session.email ?? params.user.email },
      });
    }
    return session;
  }

  session = await prisma.sahuChatSession.create({
    data: {
      origin: params.origin,
      userId: params.user?.id ?? null,
      email: params.user?.email ?? null,
      ipHash: params.ip ? hashIp(params.ip) : null,
      userAgent: params.userAgent?.slice(0, 400) ?? null,
    },
  });

  store.set(SID_COOKIE, session.id, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SID_TTL_MS / 1000,
  });

  return session;
}

// The public assistant is free for the first FREE_MESSAGES user turns; after
// that an email is required. Logged-in users are never gated.
export function needsEmail(session: SahuChatSession, user: unknown): boolean {
  return !user && !session.email && session.messageCount >= FREE_MESSAGES;
}

export async function setSessionEmail(sessionId: string, email: string): Promise<void> {
  await prisma.sahuChatSession.update({
    where: { id: sessionId },
    data: { email: email.trim().toLowerCase() },
  });
}

// One transaction: append the user turn + assistant turn, bump counters.
export async function recordTurn(params: {
  sessionId: string;
  userText: string;
  assistantText: string;
  actions?: ActionLog[];
}): Promise<void> {
  await prisma.$transaction([
    prisma.sahuChatMessage.create({
      data: { sessionId: params.sessionId, role: "user", content: params.userText.slice(0, 24_000) },
    }),
    prisma.sahuChatMessage.create({
      data: {
        sessionId: params.sessionId,
        role: "assistant",
        content: params.assistantText.slice(0, 60_000),
        actions: params.actions && params.actions.length > 0 ? params.actions : undefined,
      },
    }),
    prisma.sahuChatSession.update({
      where: { id: params.sessionId },
      data: { messageCount: { increment: 1 }, lastMessageAt: new Date() },
    }),
  ]);
}
