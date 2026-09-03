import type { Metadata, Viewport } from "next";
import { requireRoleForPage } from "@/server/auth/guards";
import { ADMIN_ROLES } from "@/lib/admin-roles";
import { IosInstallPrompt } from "@/components/ios-install-prompt";

// Manifest / apple-web-app tags and the service worker are set site-wide in
// the root layout. `title.absolute` opts out of the root "%s | Glideinbir…"
// template so the tab — and any "Add to Home Screen" shortcut — is just
// "Sahu Bhai".
export const metadata: Metadata = {
  title: { absolute: "Sahu Bhai" },
  applicationName: "Sahu Bhai",
};

export const viewport: Viewport = {
  themeColor: "#ff6a00",
};

export default async function SahuLayout({ children }: { children: React.ReactNode }) {
  await requireRoleForPage(ADMIN_ROLES, "/sahu");

  return (
    <div className="flex h-[100dvh] flex-col bg-paper">
      {children}
      <IosInstallPrompt />
    </div>
  );
}
