"use client";

import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { AdminSidebar, SidebarContent } from "@/components/admin/sidebar";
import { AdminTopBar } from "@/components/admin/topbar";
import { LogoutButton } from "@/components/site/logout-button";

// Client wrapper around the admin chrome: fixed sidebar on desktop, a
// slide-over drawer on mobile/tablet, and the sticky header with a
// hamburger. Kept out of layout.tsx so the drawer state can live in React
// while the layout itself stays a server component.
export function AdminShell({
  user,
  children,
}: {
  user: { name: string; role: string };
  children: React.ReactNode;
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const initial = user.name.trim().charAt(0).toUpperCase();

  // Lock body scroll while the drawer is open, and close it on Escape.
  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDrawerOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [drawerOpen]);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-orange-50/50 via-surface to-indigo-50/40">
      <AdminSidebar role={user.role} />

      {/* Mobile drawer */}
      <div className="lg:hidden" hidden={!drawerOpen}>
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          onClick={() => setDrawerOpen(false)}
          aria-hidden
        />
        <div className="fixed inset-y-0 left-0 z-50 flex w-64 max-w-[80vw] flex-col border-r border-border bg-surface shadow-xl">
          <button
            type="button"
            onClick={() => setDrawerOpen(false)}
            aria-label="Close menu"
            className="absolute right-3 top-3 z-10 rounded-md p-1.5 text-muted hover:bg-black/5 hover:text-ink"
          >
            <X className="h-5 w-5" />
          </button>
          <SidebarContent role={user.role} onNavigate={() => setDrawerOpen(false)} />
        </div>
      </div>

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-2 border-b border-border bg-paper/80 px-4 backdrop-blur sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-2">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              aria-label="Open menu"
              className="-ml-1 rounded-md p-2 text-ink hover:bg-black/5 lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <AdminTopBar />
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-brand to-brand-dark text-sm font-semibold text-white">
              {initial}
            </div>
            <div className="hidden leading-tight sm:block">
              <p className="text-sm font-medium">{user.name}</p>
              <p className="text-xs text-muted">{user.role.replace(/_/g, " ")}</p>
            </div>
            <LogoutButton />
          </div>
        </header>
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
