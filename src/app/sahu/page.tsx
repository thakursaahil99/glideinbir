import Link from "next/link";
import { getCurrentUser } from "@/server/auth/guards";
import { hasRole } from "@/server/auth/rbac";
import { ADMIN_ROLES } from "@/lib/admin-roles";
import { SahuBhaiChat } from "@/components/admin/sahu-bhai-chat";
import { SahuBadge } from "@/components/sahu-mark";
import { PwaInstallButton } from "@/components/pwa-install-button";

// Full-screen, installable Sahu Bhai — the PWA's start_url. Open to everyone:
//   - signed-in admin  → admin assistant (/api/admin/assistant), with the
//     Read-only / Make-changes toggle for a SUPER_ADMIN
//   - anyone else      → public assistant (/api/sahu): general help, and full
//     assistant + live data once they share an email
export default async function SahuPage() {
  const user = await getCurrentUser();
  const isAdmin = user ? hasRole(user.role, ADMIN_ROLES) : false;
  const isSuperAdmin = user?.role === "SUPER_ADMIN";

  return (
    <>
      <header className="flex shrink-0 items-center justify-between gap-2 border-b border-border bg-surface px-4 py-3">
        <div className="flex items-center gap-2">
          <SahuBadge className="h-8 w-8 rounded-full" />
          <div className="leading-tight">
            <p className="text-sm font-semibold">Sahu Bhai</p>
            <p className="text-[11px] text-muted">
              {isAdmin ? "Glideinbir admin assistant" : "Glideinbir assistant"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <PwaInstallButton />
          {isAdmin ? (
            <Link href="/admin" className="text-xs font-medium text-muted hover:text-ink">
              Admin →
            </Link>
          ) : (
            // No login / admin affordance for the public — just a way back to
            // the site. Admins reach admin mode by already being signed in.
            <Link href="/" className="text-xs font-medium text-muted hover:text-ink">
              glideinbir.com ↗
            </Link>
          )}
        </div>
      </header>

      {isAdmin ? (
        <SahuBhaiChat className="flex-1" showModeToggle={isSuperAdmin} />
      ) : (
        <SahuBhaiChat
          className="flex-1"
          endpoint="/api/sahu"
          storageKey="sahu-bhai:public"
          showModeToggle={false}
          emptyHint="Ask about paragliding, Bir Billing, trip planning — anything. Share your email to unlock the full assistant and live prices."
          starters={[
            "What paragliding packages do you have?",
            "Best time to visit Bir Billing?",
            "Is tandem paragliding safe?",
            "Plan me a 2-day Bir Billing trip",
          ]}
        />
      )}
    </>
  );
}
