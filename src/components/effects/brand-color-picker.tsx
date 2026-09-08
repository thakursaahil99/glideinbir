"use client";

import { useSyncExternalStore } from "react";
import { clsx } from "clsx";
import { RotateCcw } from "lucide-react";
import { BRAND_PALETTE, applyBrandColor, resetBrandColor } from "@/lib/theme-color";

const STORAGE_KEY = "glideinbir-brand-color";
const DEFAULT_HEX = BRAND_PALETTE[0]!.hex;

// Tiny store so the swatch grid can reflect the current pick (for the
// "selected" ring + the Reset button) without a setState-in-effect.
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());

function readHex(): string {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as { brand?: string };
      if (parsed?.brand) return parsed.brand.toLowerCase();
    }
  } catch {
    /* ignore */
  }
  return DEFAULT_HEX;
}

function useBrandHex(): string {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      window.addEventListener("storage", cb);
      return () => {
        listeners.delete(cb);
        window.removeEventListener("storage", cb);
      };
    },
    readHex,
    () => DEFAULT_HEX,
  );
}

// Real HTML swatches — click one, the whole site retunes to it. Replaces the
// old 3D palette cubes, which were fiddly to hit accurately.
export function BrandColorPicker({ className }: { className?: string }) {
  const active = useBrandHex();

  function pick(hex: string) {
    applyBrandColor(hex);
    notify();
  }

  function reset() {
    resetBrandColor();
    notify();
  }

  return (
    <div className={clsx("flex flex-wrap items-center gap-2", className)}>
      {BRAND_PALETTE.map(({ hex, name }) => {
        const selected = active === hex.toLowerCase();
        return (
          <button
            key={hex}
            type="button"
            onClick={() => pick(hex)}
            aria-label={`Theme the site ${name}`}
            aria-pressed={selected}
            title={name}
            className="h-8 w-8 rounded-full transition-transform hover:scale-110"
            style={{
              backgroundColor: hex,
              boxShadow: selected
                ? `0 0 0 2px var(--color-paper), 0 0 0 4px ${hex}`
                : "inset 0 0 0 1px rgba(0,0,0,0.12)",
            }}
          />
        );
      })}
      {active !== DEFAULT_HEX && (
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-paper px-3 py-1.5 text-xs text-muted transition-colors hover:text-ink"
        >
          <RotateCcw className="h-3 w-3" strokeWidth={2.5} />
          Reset
        </button>
      )}
    </div>
  );
}
