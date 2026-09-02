"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { MODULE_THEME } from "@/lib/module-theme";
import { ADMIN_SECTIONS } from "@/lib/admin-nav";

export function AdminSidebar({ role }: { role: string }) {
  const pathname = usePathname();

  // Super Admin sees everything, no filtering. Everyone else sees only the
  // links their role is actually allowed to use (roles: null = everyone;
  // roles: [] = nobody but Super Admin) — then any section left with zero
  // visible links is dropped entirely.
  const sections =
    role === "SUPER_ADMIN"
      ? ADMIN_SECTIONS
      : ADMIN_SECTIONS.map((section) => ({
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
        {sections.map((section) => {
          const theme = MODULE_THEME[section.theme];
          return (
            <div key={section.title}>
              <p className="flex items-center gap-1.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted">
                <span className={clsx("h-1.5 w-1.5 rounded-full", theme.solid)} />
                {section.title}
              </p>
              <div className="mt-2 space-y-0.5">
                {section.links.map((link) => {
                  // "/admin" is a prefix of every other admin route, so it
                  // needs an exact match — startsWith would keep Dashboard
                  // highlighted no matter which section you're actually on.
                  const active =
                    pathname === link.href ||
                    (link.href !== "/admin" && pathname.startsWith(`${link.href}/`));
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={clsx(
                        "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                        active ? clsx(theme.solid, "text-white shadow-sm") : "text-ink/80 hover:bg-black/5 hover:text-ink",
                      )}
                    >
                      <span
                        className={clsx(
                          "flex h-6 w-6 shrink-0 items-center justify-center rounded-md",
                          active ? "bg-white/20" : clsx(theme.soft, theme.text),
                        )}
                      >
                        <Icon className="h-3.5 w-3.5" strokeWidth={2.25} />
                      </span>
                      {link.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
