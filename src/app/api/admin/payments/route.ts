import { requireRole } from "@/server/auth/guards";
import { prisma } from "@/server/db/prisma";
import { withErrorHandling, apiSuccess } from "@/server/lib/api-response";

export const GET = withErrorHandling(async () => {
  await requireRole("SUPER_ADMIN", "FINANCE_MANAGER");
  const payments = await prisma.payment.findMany({
    include: { booking: true, refunds: true },
    orderBy: { createdAt: "desc" },
  });
  return apiSuccess(payments);
});
