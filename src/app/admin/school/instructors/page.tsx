"use client";

import { SimpleEntityManager } from "@/components/admin/simple-entity-manager";

type Instructor = { id: string; name: string; experienceYears: number | null; isActive: boolean };

export default function AdminInstructorsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Instructors</h1>
      <div className="mt-6">
        <SimpleEntityManager<Instructor>
          apiBase="/api/admin/school/instructors"
          fields={[
            { name: "name", label: "Name", type: "text", required: true },
            { name: "bio", label: "Bio", type: "textarea" },
            { name: "experienceYears", label: "Years of experience", type: "number" },
            { name: "contactEmail", label: "Contact email", type: "text" },
            { name: "contactPhone", label: "Contact phone", type: "text" },
          ]}
          columns={[
            { key: "name", label: "Name", render: (i) => i.name },
            { key: "exp", label: "Experience", render: (i) => (i.experienceYears ? `${i.experienceYears} yrs` : "—") },
            { key: "active", label: "Active", render: (i) => (i.isActive ? "Yes" : "No") },
          ]}
        />
      </div>
    </div>
  );
}
