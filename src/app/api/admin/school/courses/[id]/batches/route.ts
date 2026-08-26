import { NextRequest } from "next/server";
import { requireRole } from "@/server/auth/guards";
import { batchService } from "@/server/modules/school/service";
import { batchInputSchema } from "@/server/modules/school/validation";
import { withErrorHandling, apiSuccess } from "@/server/lib/api-response";

export const GET = withErrorHandling(
  async (_request: Request, context: { params: Promise<{ id: string }> }) => {
    await requireRole("SUPER_ADMIN", "SCHOOL_MANAGER");
    const { id } = await context.params;
    const batches = await batchService.listForCourse(id);
    return apiSuccess(batches);
  },
);

export const POST = withErrorHandling(
  async (request: NextRequest, context: { params: Promise<{ id: string }> }) => {
    await requireRole("SUPER_ADMIN", "SCHOOL_MANAGER");
    const { id } = await context.params;
    const input = batchInputSchema.parse(await request.json());
    const batch = await batchService.create(id, input);
    return apiSuccess(batch, 201);
  },
);
