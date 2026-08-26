"use client";

import { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "./use-reduced-motion";

type Variant = "stars" | "dust" | "sparkles";

interface Particle {
  x: number;
  y: number;
  size: number;
  vx: number;
  vy: number;
  phase: number;
  baseOpacity: number;
}

const VARIANT_CONFIG: Record<Variant, { color: string; speed: number; size: [number, number] }> = {
  stars: { color: "255,255,255", speed: 0.02, size: [0.6, 1.8] },
  dust: { color: "255,255,255", speed: 0.08, size: [1, 2.5] },
  sparkles: { color: "255,170,80", speed: 0.05, size: [1.5, 3] },
};

// Lightweight canvas particle system — no dependency, capped particle count,
// pauses on tab-blur and honors prefers-reduced-motion so it never becomes
// the thing that makes a page janky.
export function ParticleField({
  variant = "stars",
  density = 60,
  className,
}: {
  variant?: Variant;
  density?: number;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const config = VARIANT_CONFIG[variant];
    let particles: Particle[] = [];
    let width = 0;
    let height = 0;
    let animationFrame = 0;
    let visible = !document.hidden;

    function resize() {
      const parent = canvas!.parentElement;
      if (!parent) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = parent.clientWidth;
      height = parent.clientHeight;
      canvas!.width = width * dpr;
      canvas!.height = height * dpr;
      canvas!.style.width = `${width}px`;
      canvas!.style.height = `${height}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.min(density, 120);
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        size: config.size[0] + Math.random() * (config.size[1] - config.size[0]),
        vx: (Math.random() - 0.5) * config.speed,
        vy: (Math.random() - 0.5) * config.speed - (variant === "dust" ? 0.03 : 0),
        phase: Math.random() * Math.PI * 2,
        baseOpacity: 0.3 + Math.random() * 0.5,
      }));
    }

    function draw(time: number) {
      if (!visible) {
        animationFrame = requestAnimationFrame(draw);
        return;
      }
      ctx!.clearRect(0, 0, width, height);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        const twinkle = reducedMotion ? 1 : 0.5 + 0.5 * Math.sin(time / 900 + p.phase);
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(${config.color}, ${p.baseOpacity * twinkle})`;
        ctx!.fill();
      }
      animationFrame = requestAnimationFrame(draw);
    }

    const handleVisibility = () => {
      visible = !document.hidden;
    };

    resize();
    const resizeObserver = new ResizeObserver(resize);
    if (canvas.parentElement) resizeObserver.observe(canvas.parentElement);
    document.addEventListener("visibilitychange", handleVisibility);

    if (reducedMotion) {
      draw(0);
    } else {
      animationFrame = requestAnimationFrame(draw);
    }

    return () => {
      cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [variant, density, reducedMotion]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={className}
      style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
    />
  );
}
