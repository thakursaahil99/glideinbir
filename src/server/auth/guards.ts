import type { User, UserRole } from "@prisma/client";
import { redirect } from "next/navigation";
import { getSessionTokenFromCookies, getSessionUser } from "./session";
import { hasRole } from "./rbac";
import { UnauthorizedError, ForbiddenError } from "@/server/lib/errors";

export async function getCurrentUser(): Promise<User | null> {
  const token = await getSessionTokenFromCookies();
  if (!token) return null;
  return getSessionUser(token);
}

export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) throw new UnauthorizedError();
  return user;
}

// Wraps every admin route handler / admin server component data loader
// (ARCHITECTURE.md section 10). Throws rather than returning a boolean so
// callers can't accidentally ignore the check.
export async function requireRole(...allowed: UserRole[]): Promise<User> {
  const user = await requireUser();
  if (!hasRole(user.role, allowed)) throw new ForbiddenError();
  return user;
}

// requireUser()/requireRole() throw AppErrors, which is right for API
// routes (withErrorHandling turns them into a JSON error response) but
// wrong for a Server Component page — an uncaught throw there renders
// Next's generic error page instead of sending the visitor to log in. Use
// these in page.tsx/layout.tsx files instead.
export async function requireUserForPage(currentPath?: string): Promise<User> {
  const user = await getCurrentUser();
  if (!user) {
    redirect(currentPath ? `/login?redirect=${encodeURIComponent(currentPath)}` : "/login");
  }
  return user;
}

export async function requireRoleForPage(
  allowed: UserRole[],
  currentPath?: string,
): Promise<User> {
  const user = await requireUserForPage(currentPath);
  if (!hasRole(user.role, allowed)) redirect("/");
  return user;
}
