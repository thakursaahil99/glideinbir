import type { UserRole } from "@prisma/client";

// Every role that may reach the /admin area. Kept here (not inline in a page)
// so the admin layout guard and the Sahu Bhai assistant route agree on
// exactly who counts as an admin. The sidebar/nav in admin-nav.ts stays
// separate — it decides which links a role sees, a finer-grained concern.
export const ADMIN_ROLES: UserRole[] = [
  "SUPER_ADMIN",
  "BOOKING_MANAGER",
  "PARAGLIDING_MANAGER",
  "SCHOOL_MANAGER",
  "HOTEL_MANAGER",
  "ADVENTURE_MANAGER",
  "TRAVEL_MANAGER",
  "FINANCE_MANAGER",
  "CONTENT_MANAGER",
];
