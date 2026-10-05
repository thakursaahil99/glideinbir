"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Cloud, CloudFog, CloudLightning, CloudRain, Moon, Snowflake, Sun } from "lucide-react";
import { usePrefersReducedMotion } from "./use-reduced-motion";

// Live weather layer over the whole site: whatever the sky over Bir Billing
// is doing right now (Open-Meteo via /api/weather) — sunshine, cloud, rain,
// a thunderstorm, snow, fog or a starry night — drawn lightly on top of
// every page, refreshed every 5 minutes. Staff can override it from the
// admin dashboard when the forecast misses local cloud. How much rain / snow is drawn
// follows the measured amount (`level`, 0…1), not just the weather type.
// Override for testing: ?weather=sun|night|clouds|rain|storm|snow|fog|none
// (&intensity=light|moderate|heavy or &level=0…1). ?season= still works.
type Effect = "sun" | "night" | "clouds" | "rain" | "snow" | "storm" | "fog" | "none";
type Intensity = "light" | "moderate" | "heavy";
type Sky = {
  effect: Effect;
  level: number;
  label: string;
  temperatureC: number | null;
};

const INTENSITY_LEVEL: Record<Intensity, number> = { light: 0.3, moderate: 0.6, heavy: 1 };

const REFRESH_MS = 5 * 60 * 1000;
const EFFECTS: Effect[] = ["sun", "night", "clouds", "rain", "snow", "storm", "fog", "none"];
const INTENSITIES: Intensity[] = ["light", "moderate", "heavy"];

// Returned as a string ("rain:0.6") so the snapshot is stable between reads.
function readOverride(): string {
  try {
    const q = new URLSearchParams(window.location.search);
    const effect = (q.get("weather") ?? q.get("season")) as Effect | null;
    if (!effect || !EFFECTS.includes(effect)) return "";
    const i = q.get("intensity") as Intensity | null;
    const raw = Number(q.get("level"));
    const level =
      q.get("level") && raw >= 0 && raw <= 1
        ? raw
        : INTENSITY_LEVEL[i && INTENSITIES.includes(i) ? i : "moderate"];
    return `${effect}:${level}`;
  } catch {
    return "";
  }
}

function useOverride(): Sky | null {
  const key = useSyncExternalStore(
    (cb) => {
      window.addEventListener("popstate", cb);
      return () => window.removeEventListener("popstate", cb);
    },
    readOverride,
    () => "",
  );
  if (!key) return null;
  const [effect, level] = key.split(":");
  return { effect: effect as Effect, level: Number(level), label: "Preview", temperatureC: null };
}

function useLiveSky(): Sky | null {
  const override = useOverride();
  const [sky, setSky] = useState<Sky | null>(null);
  const skip = override !== null;

  useEffect(() => {
    if (skip) return;

    let lastFetch = 0;
    let cancelled = false;
    async function load() {
      lastFetch = Date.now();
      try {
        const res = await fetch("/api/weather");
        if (!res.ok) return;
        const data = (await res.json()) as Sky;
        if (!cancelled && EFFECTS.includes(data.effect)) setSky(data);
      } catch {
        // Weather is decoration — keep whatever we last had.
      }
    }

    load();
    const timer = window.setInterval(load, REFRESH_MS);
    // A tab left in the background for hours catches up as soon as it's seen.
    const onVisible = () => {
      if (!document.hidden && Date.now() - lastFetch > REFRESH_MS) load();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [skip]);

  return override ?? sky;
}

export function SeasonalOverlay() {
  const sky = useLiveSky();
  const reducedMotion = usePrefersReducedMotion();

  if (!sky || sky.effect === "none") return null;

  return (
    <>
      {!reducedMotion && (
        // Rounded so a tiny change in measured rain doesn't restart the canvas.
        <SkyCanvas effect={sky.effect} level={Math.round((sky.level ?? 0.6) * 10) / 10} />
      )}
      <SkyChip sky={sky} />
    </>
  );
}

const CHIP_ICON = {
  sun: Sun,
  night: Moon,
  clouds: Cloud,
  rain: CloudRain,
  snow: Snowflake,
  storm: CloudLightning,
  fog: CloudFog,
} as const;

// "Bir right now: Light rain · 18°C" — shown for a few seconds once per
// visit, so the effect reads as live weather rather than decoration.
function SkyChip({ sky }: { sky: Sky }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem("sky-chip-seen") === sky.effect) return;
      sessionStorage.setItem("sky-chip-seen", sky.effect);
    } catch {
      // No storage — just show it.
    }
    const on = window.setTimeout(() => setShow(true), 1200);
    const off = window.setTimeout(() => setShow(false), 7200);
    return () => {
      window.clearTimeout(on);
      window.clearTimeout(off);
    };
  }, [sky.effect]);

  if (sky.effect === "none") return null;
  const Icon = CHIP_ICON[sky.effect];

  return (
    <div className="pointer-events-none fixed inset-x-0 top-20 z-[45] flex justify-center px-4">
      <AnimatePresence>
        {show && (
          <motion.button
            type="button"
            onClick={() => setShow(false)}
            initial={{ opacity: 0, y: -16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.95 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="pointer-events-auto flex items-center gap-2 rounded-full border border-white/40 bg-ink/75 px-4 py-2 text-sm text-white shadow-lg backdrop-blur-md"
            aria-label="Dismiss weather notice"
          >
            <Icon className="h-4 w-4 text-brand" />
            <span className="font-medium">Bir right now:</span>
            <span className="text-white/85">
              {sky.label}
              {sky.temperatureC !== null && ` · ${sky.temperatureC}°C`}
            </span>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

function SkyCanvas({ effect, level }: { effect: Exclude<Effect, "none">; level: number }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    return mountCanvas(ref.current, effect, level);
  }, [effect, level]);

  return <canvas ref={ref} aria-hidden className="pointer-events-none fixed inset-0 z-[35]" />;
}

type Drop = { x: number; y: number; len: number; vy: number; vx: number; o: number };
// z = depth 0 (far) … 1 (near): near flakes are bigger, faster, stronger.
type Flake = {
  x: number;
  y: number;
  r: number;
  vy: number;
  drift: number;
  phase: number;
  o: number;
  z: number;
};
type Puff = { x: number; y: number; r: number; vx: number; o: number };
type Star = { x: number; y: number; r: number; phase: number; speed: number };

// Imperative canvas loop — kept out of React so a resize or a frame never
// triggers a re-render. Returns a cleanup fn.
function mountCanvas(canvas: HTMLCanvasElement, effect: Exclude<Effect, "none">, level: number): () => void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return () => {};

  // level 0…1 → how many drops/flakes, how fast, how strong. A drizzle
  // (~0.2) is a sparse, slow sprinkle; a downpour (1) is dense and fast.
  const k = 0.12 + level * 2.2;
  const speed = 0.8 + level * 0.5;
  const alpha = 0.6 + level * 0.8;
  const raining = effect === "rain" || effect === "storm";
  let w = 0;
  let h = 0;
  let raf = 0;
  let visible = !document.hidden;
  let drops: Drop[] = [];
  let flakes: Flake[] = [];
  let puffs: Puff[] = [];
  let stars: Star[] = [];
  // Lightning: brightness of the current flash, and when the next one fires.
  let flash = 0;
  let nextFlash = performance.now() + 3000;

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

    // Scale count to the viewport (so phones get far fewer), then level.
    const area = w * h;
    const big = Math.max(w, h);
    if (raining) {
      const stormBoost = effect === "storm" ? 1.3 : 1;
      const count = Math.min(420, Math.round((area / 5200) * k * stormBoost));
      const slant = effect === "storm" ? 2 : 1;
      drops = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        len: rand(10, 22) * (0.8 + level * 0.9) * speed,
        vy: rand(12, 19) * speed,
        vx: rand(-2.6, -1.1) * slant,
        o: rand(0.14, 0.34) * (0.75 + level * 0.6),
      }));
    } else if (effect === "snow") {
      const count = Math.min(220, Math.round((area / 11000) * k));
      flakes = Array.from({ length: count }, () => {
        const z = Math.random();
        return {
          x: Math.random() * w,
          y: Math.random() * h,
          r: (0.8 + z * 3.2) * (level > 0.8 ? 1.15 : 1),
          vy: (0.35 + z * 1.3) * speed,
          drift: 0.2 + z * 0.8,
          phase: Math.random() * Math.PI * 2,
          o: 0.35 + z * 0.55,
          z,
        };
      });
    } else if (effect === "fog") {
      puffs = Array.from({ length: 9 }, () => ({
        x: Math.random() * w,
        y: rand(0.1, 1.05) * h,
        r: rand(0.3, 0.55) * big,
        vx: rand(0.1, 0.35) * (Math.random() < 0.5 ? -1 : 1),
        o: rand(0.06, 0.13) * alpha,
      }));
    } else if (effect === "clouds") {
      puffs = Array.from({ length: level < 0.45 ? 4 : 7 }, () => ({
        x: Math.random() * w,
        y: rand(-0.05, 0.35) * h,
        r: rand(0.14, 0.26) * big,
        vx: rand(0.12, 0.3),
        o: rand(0.07, 0.12) * alpha,
      }));
    } else if (effect === "night") {
      // Stars only in the upper part of the screen, like a real sky.
      const count = Math.min(140, Math.round(area / 9000));
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.pow(Math.random(), 1.6) * h * 0.6,
        r: rand(0.7, 2.1),
        phase: Math.random() * Math.PI * 2,
        speed: rand(600, 1800),
      }));
    }
  }

  // A soft cloud: a few overlapping radial blobs around (x, y).
  function drawCloud(p: Puff, rgb: string) {
    const lobes: [number, number, number][] = [
      [0, 0, 1],
      [-0.55, 0.12, 0.7],
      [0.55, 0.1, 0.75],
      [0.2, -0.25, 0.6],
    ];
    for (const [dx, dy, s] of lobes) {
      const cx = p.x + dx * p.r;
      const cy = p.y + dy * p.r;
      const r = p.r * s;
      const g = ctx!.createRadialGradient(cx, cy, 0, cx, cy, r);
      g.addColorStop(0, `rgba(${rgb},${p.o})`);
      g.addColorStop(1, `rgba(${rgb},0)`);
      ctx!.fillStyle = g;
      ctx!.fillRect(cx - r, cy - r, r * 2, r * 2);
    }
  }

  // Sunlight: soft beams falling diagonally from the top-right corner, the
  // way light comes through a window — no particles, just light.
  const BEAMS = [
    { angle: 2.05, spread: 0.1, phase: 0 },
    { angle: 2.25, spread: 0.16, phase: 1.3 },
    { angle: 2.45, spread: 0.08, phase: 2.6 },
    { angle: 2.62, spread: 0.13, phase: 3.9 },
    { angle: 2.82, spread: 0.07, phase: 5.2 },
    { angle: 3.0, spread: 0.11, phase: 0.7 },
  ];

  function drawSun(t: number) {
    const sx = w * 1.02;
    const sy = -h * 0.08;
    const len = Math.hypot(w, h) * 1.15;

    // Warm wash across the top of the page.
    const wash = ctx!.createLinearGradient(0, 0, 0, h * 0.55);
    wash.addColorStop(0, `rgba(255,206,120,${0.16 * alpha})`);
    wash.addColorStop(1, "rgba(255,206,120,0)");
    ctx!.fillStyle = wash;
    ctx!.fillRect(0, 0, w, h * 0.55);

    // Beams: each one sways a little and breathes brighter / dimmer.
    for (const b of BEAMS) {
      const a = b.angle + Math.sin(t / 7000 + b.phase) * 0.03;
      const half = b.spread / 2;
      const ex1 = sx + Math.cos(a - half) * len;
      const ey1 = sy + Math.sin(a - half) * len;
      const ex2 = sx + Math.cos(a + half) * len;
      const ey2 = sy + Math.sin(a + half) * len;
      const strength = (0.1 + 0.07 * Math.sin(t / 2400 + b.phase * 1.7)) * alpha;

      const g = ctx!.createLinearGradient(sx, sy, sx + Math.cos(a) * len, sy + Math.sin(a) * len);
      g.addColorStop(0, `rgba(255,224,150,${strength})`);
      g.addColorStop(0.45, `rgba(255,214,130,${strength * 0.45})`);
      g.addColorStop(1, "rgba(255,214,130,0)");
      ctx!.fillStyle = g;
      ctx!.beginPath();
      ctx!.moveTo(sx, sy);
      ctx!.lineTo(ex1, ey1);
      ctx!.lineTo(ex2, ey2);
      ctx!.closePath();
      ctx!.fill();
    }

    // The sun's own glow in the corner, gently pulsing.
    const pulse = 1 + Math.sin(t / 3000) * 0.05;
    const glow = ctx!.createRadialGradient(sx, sy, 0, sx, sy, Math.max(w, h) * 0.45 * pulse);
    glow.addColorStop(0, `rgba(255,236,170,${0.42 * alpha})`);
    glow.addColorStop(0.35, `rgba(255,210,120,${0.14 * alpha})`);
    glow.addColorStop(1, "rgba(255,210,120,0)");
    ctx!.fillStyle = glow;
    ctx!.fillRect(0, 0, w, h);
  }

  function frame(t: number) {
    raf = requestAnimationFrame(frame);
    if (!visible) return;
    ctx!.clearRect(0, 0, w, h);

    if (raining) {
      ctx!.lineCap = "round";
      for (const d of drops) {
        d.x += d.vx;
        d.y += d.vy;
        if (d.y > h) {
          d.y = -d.len;
          d.x = Math.random() * w;
        }
        if (d.x < 0) d.x = w;
        ctx!.strokeStyle = `rgba(126,148,182,${d.o})`;
        ctx!.lineWidth = d.o > 0.32 ? 1.6 + level * 0.6 : 1.1;
        ctx!.beginPath();
        ctx!.moveTo(d.x, d.y);
        ctx!.lineTo(d.x + d.vx * 1.5, d.y + d.len);
        ctx!.stroke();
      }
    }

    if (effect === "storm") {
      // Double-pulse flash every 5–14 s, fading out over ~half a second.
      if (t >= nextFlash) {
        flash = 0.22;
        window.setTimeout(() => (flash = 0.16), 140);
        nextFlash = t + rand(5000, 14000);
      }
      if (flash > 0.005) {
        ctx!.fillStyle = `rgba(235,240,255,${flash})`;
        ctx!.fillRect(0, 0, w, h);
        flash *= 0.9;
      }
    }

    if (effect === "snow") {
      // Cold wash from the top so the page itself feels wintry.
      const wash = ctx!.createLinearGradient(0, 0, 0, h * 0.5);
      wash.addColorStop(0, `rgba(200,215,235,${0.16 * alpha})`);
      wash.addColorStop(1, "rgba(200,215,235,0)");
      ctx!.fillStyle = wash;
      ctx!.fillRect(0, 0, w, h * 0.5);

      for (const f of flakes) {
        f.y += f.vy;
        f.x += Math.sin(t / 1400 + f.phase) * f.drift;
        if (f.y > h + 6) {
          f.y = -6;
          f.x = Math.random() * w;
        }
        if (f.x < -6) f.x = w + 6;
        if (f.x > w + 6) f.x = -6;
        // Blue-grey rim + white core: reads on photos AND on white pages.
        ctx!.fillStyle = `rgba(140,165,200,${f.o * 0.55})`;
        ctx!.beginPath();
        ctx!.arc(f.x, f.y, f.r + 0.9, 0, Math.PI * 2);
        ctx!.fill();
        ctx!.fillStyle = `rgba(255,255,255,${f.o})`;
        ctx!.beginPath();
        ctx!.arc(f.x, f.y, f.r, 0, Math.PI * 2);
        ctx!.fill();
      }
    }

    if (effect === "fog") {
      // An even veil over everything, heavier near the ground.
      ctx!.fillStyle = `rgba(232,236,242,${0.06 * alpha})`;
      ctx!.fillRect(0, 0, w, h);
      const ground = ctx!.createLinearGradient(0, h * 0.45, 0, h);
      ground.addColorStop(0, "rgba(228,233,240,0)");
      ground.addColorStop(1, `rgba(228,233,240,${0.3 * alpha})`);
      ctx!.fillStyle = ground;
      ctx!.fillRect(0, h * 0.45, w, h * 0.55);
      for (const p of puffs) {
        p.x += p.vx;
        if (p.x - p.r > w) p.x = -p.r;
        if (p.x + p.r < 0) p.x = w + p.r;
        drawCloud(p, "236,240,245");
      }
    }

    if (effect === "clouds") {
      if (level >= 0.45) {
        ctx!.fillStyle = "rgba(120,132,150,0.05)";
        ctx!.fillRect(0, 0, w, h);
      }
      for (const p of puffs) {
        p.x += p.vx;
        if (p.x - p.r * 1.6 > w) p.x = -p.r * 1.6;
        drawCloud(p, "150,162,182");
      }
    }

    if (effect === "sun") drawSun(t);

    if (effect === "night") {
      // Deep-blue sky fading down the page, a moon glow top-right, and
      // twinkling stars (a warm core + glow so they read on white sections too).
      const sky = ctx!.createLinearGradient(0, 0, 0, h * 0.7);
      sky.addColorStop(0, `rgba(18,28,64,${0.3 * alpha})`);
      sky.addColorStop(1, "rgba(18,28,64,0)");
      ctx!.fillStyle = sky;
      ctx!.fillRect(0, 0, w, h * 0.7);

      const mx = w * 0.86;
      const my = h * 0.12;
      const moon = ctx!.createRadialGradient(mx, my, 0, mx, my, Math.max(w, h) * 0.3);
      moon.addColorStop(0, `rgba(210,222,255,${0.28 * alpha})`);
      moon.addColorStop(0.15, `rgba(190,205,250,${0.1 * alpha})`);
      moon.addColorStop(1, "rgba(190,205,250,0)");
      ctx!.fillStyle = moon;
      ctx!.fillRect(0, 0, w, h);

      for (const st of stars) {
        const tw = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t / st.speed + st.phase));
        ctx!.fillStyle = `rgba(255,200,110,${0.3 * tw})`;
        ctx!.beginPath();
        ctx!.arc(st.x, st.y, st.r + 2.2, 0, Math.PI * 2);
        ctx!.fill();
        ctx!.fillStyle = `rgba(255,226,150,${tw})`;
        ctx!.beginPath();
        ctx!.arc(st.x, st.y, st.r, 0, Math.PI * 2);
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
