import { MEDIA_VIDEOS, type MediaVideo, type VideoTag } from "@/content/media-videos";
import { hashName, poolKeyFor, type Pool, type StockKind } from "@/lib/stock-photos";

// Same idea as stock-photos.ts: placeholder videos picked from an item's
// name, so "Volvo" gets a road clip, "Triund Trek" a trail, "Tandem" a
// flight — until real footage is uploaded.

const POOL_TO_TAG: Record<Pool, VideoTag> = {
  flight: "flight",
  school: "school",
  instructor: "school",
  hotel: "hotel",
  room: "hotel",
  cottage: "hotel",
  camping: "camping",
  trekking: "trekking",
  bus: "travel",
  sedan: "travel",
  suv: "travel",
  monsoon: "bir",
  bir: "bir",
};

export function videoTagFor(kind: StockKind, name: string): VideoTag {
  // Adventure items with no telling keyword are generic adventure footage.
  const key = poolKeyFor(kind, name);
  if (kind === "adventure" && key === "bir") return "adventure";
  return POOL_TO_TAG[key];
}

function pick(list: MediaVideo[], tag: VideoTag, seed: number, count: number): MediaVideo[] {
  const matching = list.filter((v) => v.tags.includes(tag));
  const rest = list.filter((v) => !v.tags.includes(tag) && v.tags.includes("bir"));
  const ordered = [...matching, ...rest, ...list.filter((v) => !matching.includes(v) && !rest.includes(v))];
  const out: MediaVideo[] = [];
  const start = matching.length ? seed % matching.length : 0;
  for (let i = 0; i < ordered.length && out.length < count; i++) {
    const idx = i < matching.length ? (start + i) % matching.length : i;
    const v = ordered[idx];
    if (v && !out.includes(v)) out.push(v);
  }
  return out;
}

/** Landscape videos and vertical reels that fit an item, by name. */
export function mediaFor(kind: StockKind, name: string, counts = { videos: 3, reels: 5 }) {
  const tag = videoTagFor(kind, name);
  const seed = hashName(name);
  return {
    videos: pick(MEDIA_VIDEOS.filter((v) => v.kind === "video"), tag, seed, counts.videos),
    reels: pick(MEDIA_VIDEOS.filter((v) => v.kind === "reel"), tag, seed, counts.reels),
  };
}

export const ALL_REELS = MEDIA_VIDEOS.filter((v) => v.kind === "reel");
export const ALL_VIDEOS = MEDIA_VIDEOS.filter((v) => v.kind === "video");

export const TAG_LABEL: Record<VideoTag, string> = {
  flight: "Flights",
  school: "Courses",
  hotel: "Stays",
  camping: "Camping",
  trekking: "Treks",
  adventure: "Adventure",
  travel: "Travel",
  bir: "Bir & around",
};

// Every stock photo, tagged by the same prefixes the files are named with.
const PHOTO_PREFIX_TAG: [string, VideoTag][] = [
  ["fly-", "flight"],
  ["school-", "school"],
  ["stay-", "hotel"],
  ["camp-", "camping"],
  ["trek-", "trekking"],
  ["ride-", "travel"],
  ["bir-", "bir"],
];

export const ALL_PHOTOS: { src: string; tag: VideoTag }[] = [
  "fly-bir-hp", "fly-best", "fly-tandem", "fly-bir", "fly-bir-billing", "fly-activity", "fly-ready",
  "school-pilots", "school-prep", "school-pilot-takeoff", "school-upper-takeoff", "school-under",
  "bir-aerial", "bir-dhauladhar", "bir-monastery", "bir-tea", "bir-dhauladhar-layers", "bir-barot-uhl", "bir-valley",
  "camp-triund", "camp-himalaya", "camp-triund-ground",
  "trek-triund-hill", "trek-trail", "trek-ridge", "trek-barot",
  "stay-hotels", "stay-cottage-2", "stay-cottage", "stay-suite", "stay-room", "stay-machaan",
  "ride-volvo", "ride-himsuta", "ride-sedan", "ride-suv", "ride-taxis", "ride-mcleod",
].map((name) => ({
  src: `/stock/${name}.webp`,
  tag: PHOTO_PREFIX_TAG.find(([p]) => name.startsWith(p))![1],
}));
