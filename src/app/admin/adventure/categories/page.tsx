"use client";

import { SimpleEntityManager } from "@/components/admin/simple-entity-manager";

type Category = { id: string; name: string; slug: string; isActive: boolean };

export default function AdminAdventureCategoriesPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Adventure categories</h1>
      <div className="mt-6">
        <SimpleEntityManager<Category>
          apiBase="/api/admin/adventure/categories"
          fields={[
            { name: "name", label: "Name", type: "text", required: true },
            { name: "description", label: "Description", type: "textarea" },
          ]}
          columns={[
            { key: "name", label: "Name", render: (c) => c.name },
            { key: "slug", label: "Slug", render: (c) => c.slug },
            { key: "active", label: "Active", render: (c) => (c.isActive ? "Yes" : "No") },
          ]}
        />
      </div>
    </div>
  );
}
