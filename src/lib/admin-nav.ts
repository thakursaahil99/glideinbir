import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Users,
  Tags,
  Package,
  GraduationCap,
  UserRound,
  Hotel,
  Sparkles,
  CalendarCheck,
  CreditCard,
  Ticket,
  Tent,
  Bus,
  Trash2,
  Mail,
  HelpCircle,
  MessageSquareText,
  FileText,
  Newspaper,
} from "lucide-react";
import type { ModuleKey } from "./module-theme";

// `roles: null` means every admin role can see it (e.g. the Dashboard).
// Otherwise this must match exactly what that page's API route(s) accept
// via requireRole(...) — a link a role can't actually use is worse than no
// link, so keep these two in sync when a route's allowed roles change.
// Shared by the sidebar (which nav to show) and the top bar (which section
// the current page belongs to), so both always agree.
export type Role = string;
export type AdminLink = { href: string; label: string; icon: LucideIcon; roles: Role[] | null };
export type AdminSection = { title: string; theme: ModuleKey; links: AdminLink[] };

export const ADMIN_SECTIONS: AdminSection[] = [
  {
    title: "Overview",
    theme: "overview",
    links: [
      { href: "/admin", label: "Dashboard", icon: LayoutDashboard, roles: null },
      { href: "/admin/users", label: "Users & roles", icon: Users, roles: ["SUPER_ADMIN"] },
    ],
  },
  {
    title: "Paragliding",
    theme: "paragliding",
    links: [
      { href: "/admin/paragliding/categories", label: "Categories", icon: Tags, roles: ["PARAGLIDING_MANAGER"] },
      { href: "/admin/paragliding/packages", label: "Packages", icon: Package, roles: ["PARAGLIDING_MANAGER"] },
    ],
  },
  {
    title: "School",
    theme: "school",
    links: [
      { href: "/admin/school/instructors", label: "Instructors", icon: UserRound, roles: ["SCHOOL_MANAGER"] },
      { href: "/admin/school/courses", label: "Courses", icon: GraduationCap, roles: ["SCHOOL_MANAGER"] },
    ],
  },
  {
    title: "Hotels",
    theme: "hotels",
    links: [
      { href: "/admin/hotels/list", label: "Hotels", icon: Hotel, roles: ["HOTEL_MANAGER"] },
      { href: "/admin/hotels/amenities", label: "Amenities", icon: Sparkles, roles: ["HOTEL_MANAGER"] },
    ],
  },
  {
    title: "Adventure",
    theme: "adventure",
    links: [
      { href: "/admin/adventure/categories", label: "Categories", icon: Tags, roles: ["ADVENTURE_MANAGER"] },
      { href: "/admin/adventure/items", label: "Items", icon: Tent, roles: ["ADVENTURE_MANAGER"] },
    ],
  },
  {
    title: "Travel",
    theme: "travel",
    links: [{ href: "/admin/travel/routes", label: "Routes", icon: Bus, roles: ["TRAVEL_MANAGER"] }],
  },
  {
    title: "Sales",
    theme: "sales",
    links: [
      { href: "/admin/bookings", label: "Bookings", icon: CalendarCheck, roles: ["BOOKING_MANAGER", "FINANCE_MANAGER"] },
      { href: "/admin/payments", label: "Payments", icon: CreditCard, roles: ["FINANCE_MANAGER"] },
      { href: "/admin/marketing/coupons", label: "Coupons", icon: Ticket, roles: ["BOOKING_MANAGER", "FINANCE_MANAGER"] },
    ],
  },
  {
    title: "Content",
    theme: "content",
    links: [
      { href: "/admin/contact", label: "Contact messages", icon: Mail, roles: ["CONTENT_MANAGER"] },
      { href: "/admin/reviews", label: "Reviews", icon: MessageSquareText, roles: ["CONTENT_MANAGER", "BOOKING_MANAGER"] },
      { href: "/admin/faqs", label: "FAQs", icon: HelpCircle, roles: ["CONTENT_MANAGER"] },
      { href: "/admin/pages", label: "Site pages", icon: FileText, roles: ["CONTENT_MANAGER"] },
      { href: "/admin/blog", label: "Blog", icon: Newspaper, roles: ["CONTENT_MANAGER"] },
    ],
  },
  {
    title: "Super Admin",
    theme: "audit",
    links: [{ href: "/admin/audit", label: "Deleted data", icon: Trash2, roles: [] }],
  },
];

// Same "/admin is a prefix of everything" problem the sidebar's own active
// check has — pick the longest matching href so a nested page like
// /admin/bookings/[id] resolves to the "Bookings" link, not "Dashboard".
export function findActiveAdminLink(pathname: string): { link: AdminLink; section: AdminSection } | null {
  let best: { link: AdminLink; section: AdminSection } | null = null;
  for (const section of ADMIN_SECTIONS) {
    for (const link of section.links) {
      const matches = pathname === link.href || (link.href !== "/admin" && pathname.startsWith(`${link.href}/`));
      if (matches && (!best || link.href.length > best.link.href.length)) {
        best = { link, section };
      }
    }
  }
  return best;
}
