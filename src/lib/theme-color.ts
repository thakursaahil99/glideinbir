// Runtime brand-color override, driven by clicking a face on the homepage
// Rubik's cube. Writes directly to the `--color-brand`/`--color-brand-dark`
// CSS custom properties on <html> (overriding the :root defaults from
// globals.css via normal cascade — inline style beats a stylesheet rule),
// so every `bg-brand`/`text-brand`/`border-brand` utility site-wide picks it
// up instantly with no React re-render needed. Persisted to localStorage so
// it survives navigation/reload; a tiny inline script in the root layout
// re-applies it before first paint to avoid a flash of the default color.
const STORAGE_KEY = "glideinbir-brand-color";
export const DEFAULT_BRAND = "#ff6a00";

// Fired on window whenever the brand colour changes, so canvas / WebGL
// effects (which can't read CSS variables by themselves) can repaint.
export const BRAND_CHANGE_EVENT = "glideinbir:brandchange";

// Mobile browsers tint their address bar from <meta name="theme-color">.
function setThemeMeta(hex: string) {
  let meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  if (!meta) {
    meta = document.createElement("meta");
    meta.name = "theme-color";
    document.head.appendChild(meta);
  }
  meta.content = hex;
}

// Briefly enables a transition on the colour variables (see .brand-anim in
// globals.css) so a new pick washes across the page instead of snapping.
function animateSwap(root: HTMLElement) {
  root.classList.add("brand-anim");
  window.setTimeout(() => root.classList.remove("brand-anim"), 800);
}

// The swatches offered on the homepage. These are the site's own
// module-theme hues (src/lib/module-theme.ts) plus the brand orange, so
// whichever one a visitor picks the site still looks like itself.
export const BRAND_PALETTE: { hex: string; name: string }[] = [
  { hex: "#ff6a00", name: "Orange" },
  { hex: "#3b82f6", name: "Blue" },
  { hex: "#6366f1", name: "Indigo" },
  { hex: "#06b6d4", name: "Cyan" },
  { hex: "#10b981", name: "Emerald" },
  { hex: "#8b5cf6", name: "Violet" },
  { hex: "#f59e0b", name: "Amber" },
  { hex: "#ec4899", name: "Pink" },
];

function darken(hex: string, amount: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.max(0, Math.round(((num >> 16) & 255) * (1 - amount)));
  const g = Math.max(0, Math.round(((num >> 8) & 255) * (1 - amount)));
  const b = Math.max(0, Math.round((num & 255) * (1 - amount)));
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

export function applyBrandColor(hex: string) {
  if (typeof document === "undefined") return;
  const dark = darken(hex, 0.18);
  const root = document.documentElement;
  animateSwap(root);
  root.style.setProperty("--color-brand", hex);
  root.style.setProperty("--color-brand-dark", dark);
  setThemeMeta(hex);
  window.dispatchEvent(new Event(BRAND_CHANGE_EVENT));
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ brand: hex, dark }));
  } catch {
    // localStorage unavailable (private mode etc.) — color still applies for this page view.
  }
}

export function resetBrandColor() {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  animateSwap(root);
  root.style.removeProperty("--color-brand");
  root.style.removeProperty("--color-brand-dark");
  setThemeMeta(DEFAULT_BRAND);
  window.dispatchEvent(new Event(BRAND_CHANGE_EVENT));
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

// Inlined into a <script> tag in the root layout — must be a plain string,
// not a function reference (it runs before any JS bundle loads).
export const BRAND_COLOR_BOOTSTRAP_SCRIPT = `
try {
  var raw = localStorage.getItem(${JSON.stringify(STORAGE_KEY)});
  if (raw) {
    var c = JSON.parse(raw);
    if (c && c.brand && c.dark) {
      document.documentElement.style.setProperty("--color-brand", c.brand);
      document.documentElement.style.setProperty("--color-brand-dark", c.dark);
      var m = document.createElement("meta");
      m.name = "theme-color";
      m.content = c.brand;
      document.head.appendChild(m);
    }
  }
} catch (e) {}
`;
