import type { Metadata, Viewport } from "next";
import { requireRoleForPage } from "@/server/auth/guards";
import { ADMIN_ROLES } from "@/lib/admin-roles";
import { IosInstallPrompt } from "@/components/ios-install-prompt";

// Manifest / apple-web-app tags and the service worker are set site-wide in
// the root layout, so nothing PWA-specific is needed here.
export const metadata: Metadata = {
  title: "Sahu Bhai",
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
