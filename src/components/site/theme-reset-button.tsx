"use client";

import { RotateCcw } from "lucide-react";
import { resetBrandColor } from "@/lib/theme-color";

export function ThemeResetButton() {
  return (
    <button
      type="button"
      onClick={() => resetBrandColor()}
      className="pointer-events-auto inline-flex items-center gap-1.5 rounded-full border border-border bg-paper px-3 py-1.5 text-xs text-muted transition-colors hover:text-ink"
    >
      <RotateCcw className="h-3 w-3" strokeWidth={2.5} />
      Reset color
    </button>
  );
}
