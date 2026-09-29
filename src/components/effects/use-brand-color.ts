"use client";

import { useSyncExternalStore } from "react";
import { BRAND_CHANGE_EVENT, DEFAULT_BRAND } from "@/lib/theme-color";

function subscribe(callback: () => void) {
  window.addEventListener(BRAND_CHANGE_EVENT, callback);
  return () => window.removeEventListener(BRAND_CHANGE_EVENT, callback);
}

function getSnapshot() {
  const style = document.documentElement.style.getPropertyValue("--color-brand").trim();
  return style || DEFAULT_BRAND;
}

/** Current brand colour as a hex string — for canvas / WebGL effects that can't use CSS vars. */
export function useBrandColor(): string {
  return useSyncExternalStore(subscribe, getSnapshot, () => DEFAULT_BRAND);
}

/** "#ff6a00" → "255,106,0", for rgba() strings. */
export function hexToRgb(hex: string): string {
  const n = parseInt(hex.replace("#", ""), 16);
  return `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`;
}
