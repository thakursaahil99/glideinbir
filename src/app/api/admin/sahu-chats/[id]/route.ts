import { requireRole } from "@/server/auth/guards";
import { prisma } from "@/server/db/prisma";
import { withErrorHandling, apiSuccess } from "@/server/lib/api-response";
import { NotFoundError } from "@/server/lib/errors";

export const GET = withErrorHandling(
  async (_request: Request, context: { params: Promise<{ id: string }> }) => {
    await requireRole("SUPER_ADMIN");
    const { id } = await context.params;

    const session = await prisma.sahuChatSession.findUnique({
      where: { id },
      include: {
        user: { select: { name: true, email: true } },
        messages: { orderBy: { createdAt: "asc" } },
      },
    });
    if (!session) throw new NotFoundError("Conversation not found");

    return apiSuccess({
      id: session.id,
      email: session.email,
      userName: session.user?.name ?? null,
      origin: session.origin,
      createdAt: session.createdAt,
      lastMessageAt: session.lastMessageAt,
      messages: session.messages.map((m) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        actions: m.actions,
        createdAt: m.createdAt,
      })),
    });
  },
);

export const DELETE = withErrorHandling(
  async (_request: Request, context: { params: Promise<{ id: string }> }) => {
    await requireRole("SUPER_ADMIN");
    const { id } = await context.params;
    await prisma.sahuChatSession.delete({ where: { id } }).catch(() => {
      throw new NotFoundError("Conversation not found");
    });
    return apiSuccess({ deleted: true });
  },
);
