"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { usePrefersReducedMotion } from "./use-reduced-motion";

// Bir Billing weather by month → a light rain or snow layer over the whole
// site. Peak flying months (spring / autumn) get nothing, so the site stays
// clean when it matters most.
//   Dec–Feb  → snow
//   Jul–Sep  → monsoon rain
//   else     → none
// Override for testing / a manual choice: add ?season=rain | snow | none to
// any URL.
type Season = "rain" | "snow" | "none";

function seasonForMonth(month: number): Season {
  if (month === 11 || month === 0 || month === 1) return "snow";
  if (month >= 6 && month <= 8) return "rain";
  return "none";
}

function readSeason(): Season {
  try {
    const q = new URLSearchParams(window.location.search).get("season");
    if (q === "rain" || q === "snow" || q === "none") return q;
  } catch {
    /* ignore */
  }
  return seasonForMonth(new Date().getMonth());
}

// Re-evaluate on navigation (the ?season override lives in the URL) without
// pulling in usePathname/useSearchParams plumbing.
function useSeason(): Season {
  return useSyncExternalStore(
    (cb) => {
      window.addEventListener("popstate", cb);
      return () => window.removeEventListener("popstate", cb);
    },
    readSeason,
    () => "none" as Season,
  );
}

type Drop = { x: number; y: number; len: number; vy: number; vx: number; o: number };
type Flake = { x: number; y: number; r: number; vy: number; drift: number; phase: number; o: number };

export function SeasonalOverlay() {
  const season = useSeason();
  const reducedMotion = usePrefersReducedMotion();

  // Nothing to draw — render no canvas at all.
  if (season === "none" || reducedMotion) return null;

  return <SeasonCanvas season={season} />;
}

function SeasonCanvas({ season }: { season: Exclude<Season, "none"> }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    return mountCanvas(ref.current, season);
  }, [season]);

  return <canvas ref={ref} aria-hidden className="pointer-events-none fixed inset-0 z-[35]" />;
}

// Imperative canvas loop — kept out of React so a resize or a frame never
// triggers a re-render. Returns a cleanup fn (ref-callback style).
function mountCanvas(canvas: HTMLCanvasElement, season: "rain" | "snow"): () => void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return () => {};

  let w = 0;
  let h = 0;
  let raf = 0;
  let visible = !document.hidden;
  let drops: Drop[] = [];
  let flakes: Flake[] = [];

  const rand = (a: number, b: number) => a + Math.random() * (b - a);

  function seed() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Scale count to the viewport, capped, and thin it right down on phones.
    const area = w * h;
    if (season === "rain") {
      const count = Math.min(160, Math.round(area / 9000));
      drops = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        len: rand(10, 22),
        vy: rand(7, 12),
        vx: rand(-1.6, -0.6),
        o: rand(0.06, 0.16),
      }));
    } else {
      const count = Math.min(90, Math.round(area / 16000));
      flakes = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: rand(1.2, 3),
        vy: rand(0.5, 1.4),
        drift: rand(0.3, 0.9),
        phase: Math.random() * Math.PI * 2,
        o: rand(0.22, 0.55),
      }));
    }
  }

  function frame(t: number) {
    raf = requestAnimationFrame(frame);
    if (!visible) return;
    ctx!.clearRect(0, 0, w, h);

    if (season === "rain") {
      ctx!.lineCap = "round";
      for (const d of drops) {
        d.x += d.vx;
        d.y += d.vy;
        if (d.y > h) {
          d.y = -d.len;
          d.x = Math.random() * w;
        }
        if (d.x < 0) d.x = w;
        ctx!.strokeStyle = `rgba(110,132,168,${d.o})`;
        ctx!.lineWidth = 1;
        ctx!.beginPath();
        ctx!.moveTo(d.x, d.y);
        ctx!.lineTo(d.x + d.vx * 1.5, d.y + d.len);
        ctx!.stroke();
      }
    } else {
      for (const f of flakes) {
        f.y += f.vy;
        f.x += Math.sin(t / 1400 + f.phase) * f.drift;
        if (f.y > h + 4) {
          f.y = -4;
          f.x = Math.random() * w;
        }
        if (f.x < -4) f.x = w + 4;
        if (f.x > w + 4) f.x = -4;
        ctx!.fillStyle = `rgba(214,226,244,${f.o})`;
        ctx!.beginPath();
        ctx!.arc(f.x, f.y, f.r, 0, Math.PI * 2);
        ctx!.fill();
      }
    }
  }

  const onVisibility = () => {
    visible = !document.hidden;
  };
  const onResize = () => seed();

  seed();
  raf = requestAnimationFrame(frame);
  window.addEventListener("resize", onResize);
  document.addEventListener("visibilitychange", onVisibility);

  return () => {
    cancelAnimationFrame(raf);
    window.removeEventListener("resize", onResize);
    document.removeEventListener("visibilitychange", onVisibility);
  };
}
