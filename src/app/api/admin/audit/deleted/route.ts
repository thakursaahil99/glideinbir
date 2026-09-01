import { requireRole } from "@/server/auth/guards";
import { prisma } from "@/server/db/prisma";
import { withErrorHandling, apiSuccess } from "@/server/lib/api-response";
import { AUDIT_ENTITY_LABELS } from "@/server/lib/audit";

// Deleted-data trail — Super Admin only. Shows every top-level admin
// delete (see src/server/lib/audit.ts for exactly what's tracked) so it's
// clear what was removed, by whom, and whether it's been restored.
export const GET = withErrorHandling(async () => {
  await requireRole("SUPER_ADMIN");

  const logs = await prisma.auditLog.findMany({
    where: { action: { endsWith: "_DELETED" } },
    orderBy: { createdAt: "desc" },
    take: 200,
    include: {
      user: { select: { name: true, email: true } },
      restoredBy: { select: { name: true, email: true } },
    },
  });

  const items = logs.map((log) => {
    const payload = log.oldValue as { label?: string } | null;
    return {
      id: log.id,
      entityType: log.entityType,
      entityTypeLabel: AUDIT_ENTITY_LABELS[log.entityType] ?? log.entityType,
      entityId: log.entityId,
      label: payload?.label ?? log.entityId,
      deletedAt: log.createdAt,
      deletedBy: log.user,
      restoredAt: log.restoredAt,
      restoredBy: log.restoredBy,
      restorable: log.entityType in AUDIT_ENTITY_LABELS,
    };
  });

  return apiSuccess(items);
});
