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
} from "lucide-react";

const SECTIONS = [
  {
    title: "Overview",
    links: [
      { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
      { href: "/admin/users", label: "Users & roles", icon: Users },
    ],
  },
  {
    title: "Paragliding",
    links: [
      { href: "/admin/paragliding/categories", label: "Categories", icon: Tags },
      { href: "/admin/paragliding/packages", label: "Packages", icon: Package },
    ],
  },
  {
    title: "School",
    links: [
      { href: "/admin/school/instructors", label: "Instructors", icon: UserRound },
      { href: "/admin/school/courses", label: "Courses", icon: GraduationCap },
    ],
  },
  {
    title: "Hotels",
    links: [
      { href: "/admin/hotels/list", label: "Hotels", icon: Hotel },
      { href: "/admin/hotels/amenities", label: "Amenities", icon: Sparkles },
    ],
  },
  {
    title: "Adventure",
    links: [
      { href: "/admin/adventure/categories", label: "Categories", icon: Tags },
      { href: "/admin/adventure/items", label: "Items", icon: Tent },
    ],
  },
  {
    title: "Travel",
    links: [
      { href: "/admin/travel/routes", label: "Routes", icon: Bus },
    ],
  },
  {
    title: "Sales",
    links: [
      { href: "/admin/bookings", label: "Bookings", icon: CalendarCheck },
      { href: "/admin/payments", label: "Payments", icon: CreditCard },
      { href: "/admin/marketing/coupons", label: "Coupons", icon: Ticket },
    ],
  },
  {
    title: "Content",
    links: [
      { href: "/admin/contact", label: "Contact messages", icon: Mail },
      { href: "/admin/reviews", label: "Reviews", icon: MessageSquareText },
      { href: "/admin/faqs", label: "FAQs", icon: HelpCircle },
      { href: "/admin/pages", label: "Site pages", icon: FileText },
    ],
  },
];

// Shown only to Super Admins — everyone else deletes things, only Super
// Admin gets to see the trail and restore.
const SUPER_ADMIN_SECTION = {
  title: "Super Admin",
  links: [{ href: "/admin/audit", label: "Deleted data", icon: Trash2 }],
};

export function AdminSidebar({ role }: { role: string }) {
  const pathname = usePathname();
  const sections = role === "SUPER_ADMIN" ? [...SECTIONS, SUPER_ADMIN_SECTION] : SECTIONS;

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
