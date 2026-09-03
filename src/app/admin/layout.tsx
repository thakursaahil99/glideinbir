import { requireRoleForPage } from "@/server/auth/guards";
import { AdminShell } from "@/components/admin/admin-shell";
import { SahuBhai } from "@/components/admin/sahu-bhai";
import { IosInstallPrompt } from "@/components/ios-install-prompt";
import { ADMIN_ROLES } from "@/lib/admin-roles";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRoleForPage(ADMIN_ROLES, "/admin");

  return (
    <>
      <AdminShell user={{ name: user.name, role: user.role }}>{children}</AdminShell>
      <SahuBhai />
      <IosInstallPrompt />
    </>
  );
}
