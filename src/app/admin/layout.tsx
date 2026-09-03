import type { Metadata } from "next";
import { requireRoleForPage } from "@/server/auth/guards";
import { AdminShell } from "@/components/admin/admin-shell";
import { SahuBhai } from "@/components/admin/sahu-bhai";
import { PwaRegister } from "@/components/pwa-register";
import { IosInstallPrompt } from "@/components/ios-install-prompt";
import { ADMIN_ROLES } from "@/lib/admin-roles";

export const metadata: Metadata = {
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "Sahu Bhai", statusBarStyle: "default" },
  other: { "apple-mobile-web-app-capable": "yes" },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRoleForPage(ADMIN_ROLES, "/admin");

  return (
    <>
      <AdminShell user={{ name: user.name, role: user.role }}>{children}</AdminShell>
      <SahuBhai />
      <PwaRegister />
      <IosInstallPrompt />
    </>
  );
}
