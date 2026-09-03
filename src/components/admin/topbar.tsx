"use client";

import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { findActiveAdminLink } from "@/lib/admin-nav";
import { MODULE_THEME } from "@/lib/module-theme";

// Mirrors the sidebar's own colors back at the top of the page — so
// "which part of the product am I in" is answered by the header too, not
// just by whichever sidebar link happens to be highlighted.
export function AdminTopBar() {
  const pathname = usePathname();
  const active = findActiveAdminLink(pathname);
  const theme = MODULE_THEME[active?.section.theme ?? "overview"];
  const Icon = active?.link.icon;

  return (
    <div className="flex min-w-0 items-center gap-2.5">
      {Icon && (
        <span className={clsx("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", theme.soft, theme.text)}>
          <Icon className="h-4 w-4" strokeWidth={2.25} />
        </span>
      )}
      <div className="min-w-0 leading-tight">
        <p className="truncate text-sm font-semibold">{active?.link.label ?? "Dashboard"}</p>
        {active && <p className="truncate text-xs text-muted">{active.section.title}</p>}
      </div>
    </div>
  );
}
