import type { Metadata, Viewport } from "next";
import { requireRoleForPage } from "@/server/auth/guards";
import { ADMIN_ROLES } from "@/lib/admin-roles";
import { PwaRegister } from "@/components/pwa-register";

export const metadata: Metadata = {
  title: "Sahu Bhai",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "Sahu Bhai", statusBarStyle: "default" },
  // Legacy tag for older iOS — Next only emits the modern `mobile-web-app-capable`.
  other: { "apple-mobile-web-app-capable": "yes" },
};

export const viewport: Viewport = {
  themeColor: "#ff6a00",
};

export default async function SahuLayout({ children }: { children: React.ReactNode }) {
  await requireRoleForPage(ADMIN_ROLES, "/sahu");

  return (
    <div className="flex h-[100dvh] flex-col bg-paper">
      {children}
      <PwaRegister />
    </div>
  );
}
