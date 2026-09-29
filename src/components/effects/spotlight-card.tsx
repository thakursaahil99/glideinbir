"use client";

import { clsx } from "clsx";
import type { HTMLAttributes, MouseEvent } from "react";

// A card whose border lights up where the pointer is. Only writes two CSS
// custom properties per move — the glow itself is pure CSS (.spotlight-card).
export function SpotlightCard({ className, onMouseMove, ...props }: HTMLAttributes<HTMLDivElement>) {
  function handleMove(e: MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - rect.top}px`);
    onMouseMove?.(e);
  }

  return (
    <div
      className={clsx("spotlight-card rounded-2xl border border-border bg-paper shadow-sm", className)}
      onMouseMove={handleMove}
      {...props}
    />
  );
}
