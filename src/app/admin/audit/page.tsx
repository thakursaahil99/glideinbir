import { requireRoleForPage } from "@/server/auth/guards";
import { DeletedRecordsTable } from "@/components/admin/deleted-records-table";

export default async function AdminAuditPage() {
  await requireRoleForPage(["SUPER_ADMIN"], "/admin/audit");

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Deleted data</h1>
      <p className="mt-1 text-sm text-muted">
        Every category, package, hotel, room, course, route, instructor, batch, amenity, and
        coupon deleted anywhere in the admin — who deleted it and when, with a one-click restore.
        Visible to Super Admins only.
      </p>

      <div className="mt-6">
        <DeletedRecordsTable />
      </div>
    </div>
  );
}
