import { NextRequest } from "next/server";
import { contactService } from "@/server/modules/contact/service";
import { contactMessageInputSchema } from "@/server/modules/contact/validation";
import { withErrorHandling, apiSuccess } from "@/server/lib/api-response";
import { checkRateLimit, getClientIp } from "@/server/lib/rate-limit";
import { RateLimitedError } from "@/server/lib/errors";

export const POST = withErrorHandling(async (request: NextRequest) => {
  const ip = getClientIp(request);
  if (!checkRateLimit(`contact:${ip}`, 5, 10 * 60 * 1000)) {
    throw new RateLimitedError("Too many messages sent — please try again in a few minutes.");
  }

  const input = contactMessageInputSchema.parse(await request.json());
  const message = await contactService.create(input);
  return apiSuccess({ id: message.id }, 201);
});
