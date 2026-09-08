// Every business area (admin sidebar, admin page headers, the matching
// public-site section) is themed off the single runtime brand colour, so
// picking a colour on the homepage retunes the WHOLE site — section
// eyebrows, nav highlights, accent borders and all — not just buttons.
// The per-key shape is kept so callers don't change; they all resolve to
// the same brand-based classes now. `--color-brand` is set at runtime by
// applyBrandColor() (src/lib/theme-color.ts), so these update live.
export type ModuleKey =
  | "overview"
  | "paragliding"
  | "school"
  | "hotels"
  | "adventure"
  | "travel"
  | "sales"
  | "content"
  | "audit";

export interface ModuleTheme {
  /** icon / link text color */
  text: string;
  /** soft tint background, for chips and inactive icon badges */
  soft: string;
  /** solid background, for the active nav item / filled accents */
  solid: string;
  /** border color for accent rules and left-borders (all sides) */
  border: string;
  /** just the top border color, for a colored accent strip on a card */
  topBorder: string;
}

const BRAND_THEME: ModuleTheme = {
  text: "text-brand",
  soft: "bg-brand/10",
  solid: "bg-brand",
  border: "border-brand",
  topBorder: "border-t-brand",
};

export const MODULE_THEME: Record<ModuleKey, ModuleTheme> = {
  overview: BRAND_THEME,
  paragliding: BRAND_THEME,
  school: BRAND_THEME,
  hotels: BRAND_THEME,
  adventure: BRAND_THEME,
  travel: BRAND_THEME,
  sales: BRAND_THEME,
  content: BRAND_THEME,
  audit: BRAND_THEME,
};
