// One color per business area, reused everywhere that area shows up —
// the admin sidebar, admin page headers, and the matching public site
// section — so "Hotels" always reads as cyan, "School" always reads as
// indigo, etc. Plain Tailwind palette classes (already used ad hoc in the
// admin dashboard's stat cards) rather than new CSS tokens, so nothing
// else has to change to pick these up.
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
  /** border color for accent rules and left-borders */
  border: string;
}

export const MODULE_THEME: Record<ModuleKey, ModuleTheme> = {
  overview: { text: "text-brand", soft: "bg-brand/10", solid: "bg-brand", border: "border-brand" },
  paragliding: { text: "text-blue-600", soft: "bg-blue-50", solid: "bg-blue-500", border: "border-blue-400" },
  school: { text: "text-indigo-600", soft: "bg-indigo-50", solid: "bg-indigo-500", border: "border-indigo-400" },
  hotels: { text: "text-cyan-600", soft: "bg-cyan-50", solid: "bg-cyan-500", border: "border-cyan-400" },
  adventure: { text: "text-emerald-600", soft: "bg-emerald-50", solid: "bg-emerald-500", border: "border-emerald-400" },
  travel: { text: "text-violet-600", soft: "bg-violet-50", solid: "bg-violet-500", border: "border-violet-400" },
  sales: { text: "text-amber-600", soft: "bg-amber-50", solid: "bg-amber-500", border: "border-amber-400" },
  content: { text: "text-pink-600", soft: "bg-pink-50", solid: "bg-pink-500", border: "border-pink-400" },
  audit: { text: "text-red-600", soft: "bg-red-50", solid: "bg-red-500", border: "border-red-400" },
};
