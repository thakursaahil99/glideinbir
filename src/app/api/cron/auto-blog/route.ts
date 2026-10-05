import { NextRequest } from "next/server";
import { env } from "@/config/env";
import { withErrorHandling, apiSuccess } from "@/server/lib/api-response";
import { UnauthorizedError } from "@/server/lib/errors";
import { writeNextBlogPost } from "@/server/modules/blog/auto-writer";

// The LLM call can take a while on a free-tier provider.
export const maxDuration = 60;

// Runs weekly (see vercel.json). Sahu Bhai writes one new Bir Billing guide
// and saves it as a Draft in Admin → Blog (or publishes it directly when
// BLOG_AUTOPUBLISH=true). Same CRON_SECRET check as the other cron routes.
export const GET = withErrorHandling(async (request: NextRequest) => {
  if (!env.CRON_SECRET || request.headers.get("authorization") !== `Bearer ${env.CRON_SECRET}`) {
    throw new UnauthorizedError();
  }
  return apiSuccess(await writeNextBlogPost());
});
