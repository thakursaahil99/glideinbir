"use client";

import { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "./use-reduced-motion";

interface Piece {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rotation: number;
  spin: number;
  color: string;
  shape: "rect" | "circle";
}

const COLORS = ["#ff6a00", "#22d3ee", "#6366f1", "#f472b6", "#facc15", "#34d399"];
const GRAVITY = 0.16;
const DURATION_MS = 2600;

// One-shot celebratory burst — fires the moment it mounts, runs for a
// couple seconds, then leaves an empty canvas behind. Not a loop like
// ParticleField; this is for a single "something great just happened"
// moment (e.g. a booking getting confirmed), so it plays once and stops.
// Honors prefers-reduced-motion by not rendering anything at all.
export function ConfettiBurst({ pieceCount = 140 }: { pieceCount?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (reducedMotion) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = window.innerWidth;
    let height = window.innerHeight;

    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas!.width = width * dpr;
      canvas!.height = height * dpr;
      canvas!.style.width = `${width}px`;
      canvas!.style.height = `${height}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener("resize", resize);

    // Two bursts, one from each lower corner, arcing up and outward.
    const pieces: Piece[] = Array.from({ length: pieceCount }, (_, i) => {
      const fromLeft = i % 2 === 0;
      const angle = fromLeft
        ? -Math.PI / 2 + (Math.random() - 0.5) * 0.9
        : -Math.PI / 2 + (Math.random() - 0.5) * 0.9;
      const speed = 7 + Math.random() * 9;
      return {
        x: fromLeft ? width * 0.08 : width * 0.92,
        y: height * 0.95,
        vx: Math.cos(angle) * speed * (fromLeft ? 1 : -1) + (Math.random() - 0.5) * 2,
        vy: Math.sin(angle) * speed,
        size: 5 + Math.random() * 6,
        rotation: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 0.35,
        color: COLORS[Math.floor(Math.random() * COLORS.length)] ?? "#ff6a00",
        shape: Math.random() > 0.5 ? "rect" : "circle",
      };
    });

    let animationFrame = 0;
    const start = performance.now();

    function draw(now: number) {
      const elapsed = now - start;
      ctx!.clearRect(0, 0, width, height);

      const fade = Math.max(0, 1 - elapsed / DURATION_MS);
      for (const p of pieces) {
        p.vy += GRAVITY;
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.spin;

        ctx!.save();
        ctx!.translate(p.x, p.y);
        ctx!.rotate(p.rotation);
        ctx!.globalAlpha = fade;
        ctx!.fillStyle = p.color;
        if (p.shape === "rect") {
          ctx!.fillRect(-p.size / 2, -p.size / 3, p.size, p.size * 0.6);
        } else {
          ctx!.beginPath();
          ctx!.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx!.fill();
        }
        ctx!.restore();
      }

      if (elapsed < DURATION_MS) {
        animationFrame = requestAnimationFrame(draw);
      } else {
        ctx!.clearRect(0, 0, width, height);
      }
    }

    animationFrame = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", resize);
    };
  }, [pieceCount, reducedMotion]);

  if (reducedMotion) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[90]"
    />
  );
}
