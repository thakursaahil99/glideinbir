import { NextRequest } from "next/server";
import { requireRole } from "@/server/auth/guards";
import { blogService } from "@/server/modules/blog/service";
import { blogPostInputSchema } from "@/server/modules/blog/validation";
import { withErrorHandling, apiSuccess } from "@/server/lib/api-response";

export const GET = withErrorHandling(async () => {
  await requireRole("SUPER_ADMIN", "CONTENT_MANAGER");
  const posts = await blogService.list();
  return apiSuccess(posts);
});

export const POST = withErrorHandling(async (request: NextRequest) => {
  await requireRole("SUPER_ADMIN", "CONTENT_MANAGER");
  const input = blogPostInputSchema.parse(await request.json());
  const post = await blogService.create(input);
  return apiSuccess(post, 201);
});
