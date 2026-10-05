// Every business area (admin sidebar, admin page headers, the matching
// public-site section) has its own accent hue, so the site reads as a set of
// distinct, colourful sections: paragliding = sky, courses = violet,
// hotels = emerald, adventure = rose, travel = teal. Buttons, links and the
// overview stay on the runtime brand colour (--color-brand), which the
// homepage colour picker retunes. Class names are written out in full so
// Tailwind can see them.
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
  /** gradient stops for accent bars / underlines (use with bg-gradient-to-r) */
  gradient: string;
}

const BRAND_THEME: ModuleTheme = {
  text: "text-brand",
  soft: "bg-brand/10",
  solid: "bg-brand",
  border: "border-brand",
  topBorder: "border-t-brand",
  gradient: "from-brand to-amber-400",
};

const SKY: ModuleTheme = {
  text: "text-sky-600",
  soft: "bg-sky-500/10",
  solid: "bg-sky-500",
  border: "border-sky-500",
  topBorder: "border-t-sky-500",
  gradient: "from-sky-500 to-cyan-400",
};
const VIOLET: ModuleTheme = {
  text: "text-violet-600",
  soft: "bg-violet-500/10",
  solid: "bg-violet-500",
  border: "border-violet-500",
  topBorder: "border-t-violet-500",
  gradient: "from-violet-500 to-fuchsia-500",
};
const EMERALD: ModuleTheme = {
  text: "text-emerald-600",
  soft: "bg-emerald-500/10",
  solid: "bg-emerald-500",
  border: "border-emerald-500",
  topBorder: "border-t-emerald-500",
  gradient: "from-emerald-500 to-lime-400",
};
const ROSE: ModuleTheme = {
  text: "text-rose-600",
  soft: "bg-rose-500/10",
  solid: "bg-rose-500",
  border: "border-rose-500",
  topBorder: "border-t-rose-500",
  gradient: "from-rose-500 to-orange-400",
};
const TEAL: ModuleTheme = {
  text: "text-teal-600",
  soft: "bg-teal-500/10",
  solid: "bg-teal-500",
  border: "border-teal-500",
  topBorder: "border-t-teal-500",
  gradient: "from-teal-500 to-sky-400",
};
const AMBER: ModuleTheme = {
  text: "text-amber-600",
  soft: "bg-amber-500/10",
  solid: "bg-amber-500",
  border: "border-amber-500",
  topBorder: "border-t-amber-500",
  gradient: "from-amber-500 to-yellow-300",
};
const FUCHSIA: ModuleTheme = {
  text: "text-fuchsia-600",
  soft: "bg-fuchsia-500/10",
  solid: "bg-fuchsia-500",
  border: "border-fuchsia-500",
  topBorder: "border-t-fuchsia-500",
  gradient: "from-fuchsia-500 to-pink-400",
};
const INDIGO: ModuleTheme = {
  text: "text-indigo-600",
  soft: "bg-indigo-500/10",
  solid: "bg-indigo-500",
  border: "border-indigo-500",
  topBorder: "border-t-indigo-500",
  gradient: "from-indigo-500 to-blue-400",
};

export const MODULE_THEME: Record<ModuleKey, ModuleTheme> = {
  overview: BRAND_THEME,
  paragliding: SKY,
  school: VIOLET,
  hotels: EMERALD,
  adventure: ROSE,
  travel: TEAL,
  sales: AMBER,
  content: FUCHSIA,
  audit: INDIGO,
};
