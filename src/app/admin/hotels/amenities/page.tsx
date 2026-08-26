"use client";

import { SimpleEntityManager } from "@/components/admin/simple-entity-manager";

type Amenity = { id: string; name: string; icon: string | null };

export default function AdminAmenitiesPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Amenities</h1>
      <p className="mt-1 text-sm text-muted">Shared amenities that hotels and rooms can be tagged with.</p>
      <div className="mt-6">
        <SimpleEntityManager<Amenity>
          apiBase="/api/admin/hotels/amenities"
          fields={[
            { name: "name", label: "Name", type: "text", required: true, placeholder: "Free WiFi" },
            { name: "icon", label: "Icon (optional)", type: "text", placeholder: "wifi" },
          ]}
          columns={[
            { key: "name", label: "Name", render: (a) => a.name },
            { key: "icon", label: "Icon", render: (a) => a.icon ?? "—" },
          ]}
        />
      </div>
    </div>
  );
}
