"use client";

import { RotateCcw } from "lucide-react";
import { resetBrandColor } from "@/lib/theme-color";

export function ThemeResetButton() {
  return (
    <button
      type="button"
      onClick={() => resetBrandColor()}
      className="pointer-events-auto inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white/50 transition-colors hover:text-white"
    >
      <RotateCcw className="h-3 w-3" strokeWidth={2.5} />
      Reset color
    </button>
  );
}
