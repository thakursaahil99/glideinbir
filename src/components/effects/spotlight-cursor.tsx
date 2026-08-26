"use client";

import { useEffect, useRef } from "react";
import { clsx } from "clsx";

// A radial glow that follows the pointer. Position is written straight to
// CSS custom properties via a ref on every mousemove — no React state, so
// it never triggers a re-render no matter how fast the mouse moves.
export function SpotlightCursor({ className, color = "255,106,0" }: { className?: string; color?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    const parent = el?.parentElement;
    if (!el || !parent) return;

    function handleMove(e: globalThis.MouseEvent) {
      const rect = parent!.getBoundingClientRect();
      el!.style.setProperty("--spot-x", `${e.clientX - rect.left}px`);
      el!.style.setProperty("--spot-y", `${e.clientY - rect.top}px`);
      el!.style.opacity = "1";
    }
    function handleLeave() {
      el!.style.opacity = "0";
    }

    parent.addEventListener("mousemove", handleMove);
    parent.addEventListener("mouseleave", handleLeave);
    return () => {
      parent.removeEventListener("mousemove", handleMove);
      parent.removeEventListener("mouseleave", handleLeave);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      className={clsx("pointer-events-none absolute inset-0 transition-opacity duration-300", className)}
      style={{
        opacity: 0,
        background:
          "radial-gradient(500px circle at var(--spot-x, 50%) var(--spot-y, 50%), rgba(var(--spot-color), 0.15), transparent 70%)",
        ["--spot-color" as string]: color,
      }}
    />
  );
}
