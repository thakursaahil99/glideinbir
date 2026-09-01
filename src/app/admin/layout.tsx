import { requireRoleForPage } from "@/server/auth/guards";
import { AdminSidebar } from "@/components/admin/sidebar";
import { LogoutButton } from "@/components/site/logout-button";

const ADMIN_ROLES = [
  "SUPER_ADMIN",
  "BOOKING_MANAGER",
  "PARAGLIDING_MANAGER",
  "SCHOOL_MANAGER",
  "HOTEL_MANAGER",
  "ADVENTURE_MANAGER",
  "TRAVEL_MANAGER",
  "FINANCE_MANAGER",
  "CONTENT_MANAGER",
] as const;

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRoleForPage([...ADMIN_ROLES], "/admin");
  const initial = user.name.trim().charAt(0).toUpperCase();

  return (
    <div className="flex min-h-screen bg-surface">
      <AdminSidebar role={user.role} />
      <div className="flex-1">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-paper/80 px-8 backdrop-blur">
          <span className="text-sm text-muted">Manage Glideinbir</span>
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand text-sm font-semibold text-white">
              {initial}
            </div>
            <div className="leading-tight">
              <p className="text-sm font-medium">{user.name}</p>
              <p className="text-xs text-muted">{user.role.replace(/_/g, " ")}</p>
            </div>
            <LogoutButton />
          </div>
        </header>
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}
