"use client";

import { Search } from "lucide-react";

// One search box, reused above every admin table. Filtering itself is
// just matchesSearch() below — client-side only, no new endpoint per
// table — good enough for admin list sizes (tens to low hundreds of rows).
export function TableSearch({
  value,
  onChange,
  placeholder = "Search…",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="relative mb-3">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-border py-2 pl-9 pr-3 text-sm outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-brand/20"
      />
    </div>
  );
}

// Substring match against every string/number value on the row (and one
// level of nested objects, e.g. `{ category: { name } }`) — deliberately
// crude rather than per-page column config, since these are internal
// admin lists, not a customer-facing search.
export function matchesSearch(item: unknown, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return searchableText(item).includes(q);
}

function searchableText(value: unknown, depth = 0): string {
  if (value == null) return "";
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return String(value).toLowerCase() + " ";
  }
  if (depth >= 2) return "";
  if (Array.isArray(value)) {
    return value.map((v) => searchableText(v, depth + 1)).join("");
  }
  if (typeof value === "object") {
    return Object.values(value as Record<string, unknown>)
      .map((v) => searchableText(v, depth + 1))
      .join("");
  }
  return "";
}
