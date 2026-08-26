import {
  destroySession,
  clearSessionCookie,
  getSessionTokenFromCookies,
} from "@/server/auth/session";
import { withErrorHandling, apiSuccess } from "@/server/lib/api-response";

export const POST = withErrorHandling(async () => {
  const token = await getSessionTokenFromCookies();
  if (token) await destroySession(token);
  await clearSessionCookie();
  return apiSuccess({ loggedOut: true });
});
