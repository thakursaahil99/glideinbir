import type { UserRole } from "@prisma/client";

// SUPER_ADMIN always passes, regardless of the allow-list, per
// ARCHITECTURE.md section 7.
export function hasRole(role: UserRole, allowed: UserRole[]): boolean {
  return role === "SUPER_ADMIN" || allowed.includes(role);
}
