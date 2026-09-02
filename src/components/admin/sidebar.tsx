"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
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

// `roles: null` means every admin role can see it (e.g. the Dashboard).
// Otherwise this must match exactly what that page's API route(s) accept
// via requireRole(...) — a link a role can't actually use is worse than no
// link, so keep these two in sync when a route's allowed roles change.
type Role = string;
const SECTIONS: { title: string; links: { href: string; label: string; icon: typeof Users; roles: Role[] | null }[] }[] = [
  {
    title: "Overview",
    links: [
      { href: "/admin", label: "Dashboard", icon: LayoutDashboard, roles: null },
      { href: "/admin/users", label: "Users & roles", icon: Users, roles: ["SUPER_ADMIN"] },
    ],
  },
  {
    title: "Paragliding",
    links: [
      { href: "/admin/paragliding/categories", label: "Categories", icon: Tags, roles: ["PARAGLIDING_MANAGER"] },
      { href: "/admin/paragliding/packages", label: "Packages", icon: Package, roles: ["PARAGLIDING_MANAGER"] },
    ],
  },
  {
    title: "School",
    links: [
      { href: "/admin/school/instructors", label: "Instructors", icon: UserRound, roles: ["SCHOOL_MANAGER"] },
      { href: "/admin/school/courses", label: "Courses", icon: GraduationCap, roles: ["SCHOOL_MANAGER"] },
    ],
  },
  {
    title: "Hotels",
    links: [
      { href: "/admin/hotels/list", label: "Hotels", icon: Hotel, roles: ["HOTEL_MANAGER"] },
      { href: "/admin/hotels/amenities", label: "Amenities", icon: Sparkles, roles: ["HOTEL_MANAGER"] },
    ],
  },
  {
    title: "Adventure",
    links: [
      { href: "/admin/adventure/categories", label: "Categories", icon: Tags, roles: ["ADVENTURE_MANAGER"] },
      { href: "/admin/adventure/items", label: "Items", icon: Tent, roles: ["ADVENTURE_MANAGER"] },
    ],
  },
  {
    title: "Travel",
    links: [{ href: "/admin/travel/routes", label: "Routes", icon: Bus, roles: ["TRAVEL_MANAGER"] }],
  },
  {
    title: "Sales",
    links: [
      { href: "/admin/bookings", label: "Bookings", icon: CalendarCheck, roles: ["BOOKING_MANAGER", "FINANCE_MANAGER"] },
      { href: "/admin/payments", label: "Payments", icon: CreditCard, roles: ["FINANCE_MANAGER"] },
      { href: "/admin/marketing/coupons", label: "Coupons", icon: Ticket, roles: ["BOOKING_MANAGER", "FINANCE_MANAGER"] },
    ],
  },
  {
    title: "Content",
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
    links: [{ href: "/admin/audit", label: "Deleted data", icon: Trash2, roles: [] }],
  },
];

export function AdminSidebar({ role }: { role: string }) {
  const pathname = usePathname();

  // Super Admin sees everything, no filtering. Everyone else sees only the
  // links their role is actually allowed to use (roles: null = everyone;
  // roles: [] = nobody but Super Admin) — then any section left with zero
  // visible links is dropped entirely.
  const sections =
    role === "SUPER_ADMIN"
      ? SECTIONS
      : SECTIONS.map((section) => ({
          ...section,
          links: section.links.filter((link) => link.roles === null || link.roles.includes(role)),
        })).filter((section) => section.links.length > 0);

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-border bg-surface">
      <div className="flex h-14 items-center border-b border-border px-5">
        <Link href="/admin" className="text-lg font-bold tracking-tight">
          Glide<span className="text-brand">in</span>bir
          <span className="ml-1.5 rounded-full bg-ink px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
            Admin
          </span>
        </Link>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-6">
        {sections.map((section) => (
          <div key={section.title}>
            <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-muted">
              {section.title}
            </p>
            <div className="mt-2 space-y-0.5">
              {section.links.map((link) => {
                const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={clsx(
                      "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      active
                        ? "bg-brand text-white shadow-sm"
                        : "text-ink/80 hover:bg-black/5 hover:text-ink",
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" strokeWidth={2} />
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}
