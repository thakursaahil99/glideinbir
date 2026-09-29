// Placeholder photography for anything that has no uploaded media yet.
// Photos live in /public/stock (Wikimedia Commons, credited in
// public/stock/CREDITS.md). A photo is chosen by matching keywords in the
// item's name — "Volvo" gets a bus, "Triund Trek" gets a trail, "P3 course"
// gets a takeoff — and then hashed on the name, so two items in the same
// pool still get different pictures and the same item always gets the same one.
// Once real photos are uploaded through the admin panel they take over.

const s = (name: string) => `/stock/${name}.webp`;

const POOLS = {
  flight: ["fly-bir-hp", "fly-best", "fly-tandem", "fly-bir", "fly-bir-billing", "fly-activity", "fly-ready"],
  school: ["school-pilots", "school-prep", "school-pilot-takeoff", "school-upper-takeoff", "school-under", "fly-ready"],
  instructor: ["school-pilot-takeoff", "school-pilots", "school-prep", "fly-ready"],
  hotel: ["stay-hotels", "stay-cottage-2", "stay-cottage", "stay-suite", "bir-aerial"],
  room: ["stay-room", "stay-suite", "stay-cottage", "stay-hotels", "stay-cottage-2", "stay-machaan"],
  cottage: ["stay-machaan", "stay-cottage", "stay-cottage-2", "stay-suite"],
  camping: ["camp-triund", "camp-himalaya", "camp-triund-ground"],
  trekking: ["trek-triund-hill", "trek-trail", "trek-ridge", "trek-barot", "bir-barot-uhl"],
  bus: ["ride-volvo", "ride-himsuta", "ride-mcleod"],
  sedan: ["ride-sedan", "ride-taxis", "ride-mcleod"],
  suv: ["ride-suv", "ride-taxis", "ride-mcleod"],
  monsoon: ["bir-valley", "bir-barot-uhl", "trek-ridge"],
  bir: ["bir-aerial", "bir-dhauladhar", "bir-monastery", "bir-tea", "bir-dhauladhar-layers", "bir-barot-uhl", "bir-valley"],
} as const;

type Pool = keyof typeof POOLS;

export type StockKind = "paragliding" | "course" | "instructor" | "hotel" | "room" | "adventure" | "travel" | "blog";

const KIND_DEFAULT: Record<StockKind, Pool> = {
  paragliding: "flight",
  course: "school",
  instructor: "instructor",
  hotel: "hotel",
  room: "room",
  adventure: "bir",
  travel: "sedan",
  blog: "bir",
};

// First match wins, so the more specific words come first.
const KEYWORDS: [RegExp, Pool][] = [
  [/volvo|\bbus\b|sleeper|coach/i, "bus"],
  [/\bsuv\b|innova|ertiga|tempo/i, "suv"],
  [/taxi|cab|sedan|\bcar\b|reach/i, "sedan"],
  [/\bp[1-4]\b|course|school|training|basics|certif|thermal/i, "school"],
  [/camp|tent|dome/i, "camping"],
  [/trek|hike|trail|expedition|triund|rajgundha|bhangal/i, "trekking"],
  [/cottage|machaan|glass house|villa/i, "cottage"],
  [/room|suite|bunk|hostel|dorm|deluxe/i, "room"],
  [/hotel|\binn\b|basecamp|resort|homestay|\bstay\b/i, "hotel"],
  [/monsoon|\brains?\b/i, "monsoon"],
  [/best time|season|weather/i, "bir"],
  [/tandem|flight|fly|glid|safe/i, "flight"],
];

function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function poolFor(kind: StockKind, name: string): readonly string[] {
  const match = KEYWORDS.find(([re]) => re.test(name));
  return POOLS[match ? match[1] : KIND_DEFAULT[kind]];
}

/** One placeholder photo that fits the item's name. */
export function stockPhoto(kind: StockKind, name: string): string {
  const pool = poolFor(kind, name);
  return s(pool[hash(name) % pool.length]!);
}

/**
 * Gallery for a detail page: the item's own photos first, then fitting
 * placeholders until there are at least `min`, without repeating any.
 */
export function withStockGallery(urls: string[], kind: StockKind, name: string, min = 4): string[] {
  const out = [...urls];
  const pool = poolFor(kind, name);
  const extra = [...pool, ...POOLS.bir];
  const start = hash(name) % pool.length;
  for (let i = 0; out.length < min && i < extra.length; i++) {
    const idx = i < pool.length ? (start + i) % pool.length : i;
    const url = s(extra[idx]!);
    if (!out.includes(url)) out.push(url);
  }
  return out;
}
