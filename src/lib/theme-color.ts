// Runtime brand-color override, driven by clicking a face on the homepage
// Rubik's cube. Writes directly to the `--color-brand`/`--color-brand-dark`
// CSS custom properties on <html> (overriding the :root defaults from
// globals.css via normal cascade — inline style beats a stylesheet rule),
// so every `bg-brand`/`text-brand`/`border-brand` utility site-wide picks it
// up instantly with no React re-render needed. Persisted to localStorage so
// it survives navigation/reload; a tiny inline script in the root layout
// re-applies it before first paint to avoid a flash of the default color.
const STORAGE_KEY = "glideinbir-brand-color";

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
  root.style.setProperty("--color-brand", hex);
  root.style.setProperty("--color-brand-dark", dark);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ brand: hex, dark }));
  } catch {
    // localStorage unavailable (private mode etc.) — color still applies for this page view.
  }
}

export function resetBrandColor() {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.style.removeProperty("--color-brand");
  root.style.removeProperty("--color-brand-dark");
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
    }
  }
} catch (e) {}
`;
