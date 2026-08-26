import { NextRequest } from "next/server";
import { z } from "zod";
import { requireRole } from "@/server/auth/guards";
import { prisma } from "@/server/db/prisma";
import { paymentService } from "@/server/modules/payment/service";
import { NotFoundError } from "@/server/lib/errors";
import { withErrorHandling, apiSuccess } from "@/server/lib/api-response";

const refundSchema = z.object({
  amount: z.number().positive().optional(),
  reason: z.string().trim().max(500).optional(),
});

export const POST = withErrorHandling(
  async (request: NextRequest, context: { params: Promise<{ id: string }> }) => {
    await requireRole("SUPER_ADMIN", "FINANCE_MANAGER");
    const { id } = await context.params;
    const { amount, reason } = refundSchema.parse(await request.json().catch(() => ({})));

    const payment = await prisma.payment.findFirst({
      where: { bookingId: id, status: "SUCCESS" },
      orderBy: { createdAt: "desc" },
    });
    if (!payment) throw new NotFoundError("No successful payment found for this booking");

    const refund = await paymentService.initiateRefund(
      payment.id,
      amount ?? payment.amount.toNumber(),
      reason,
    );
    return apiSuccess(refund, 201);
  },
);
