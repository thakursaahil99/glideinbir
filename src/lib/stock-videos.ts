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
  adventure: "adventure",
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
  ["adv-", "adventure"],
  ["ride-", "travel"],
  ["bir-", "bir"],
];

export const ALL_PHOTOS: { src: string; tag: VideoTag }[] = [
  "fly-bir-hp", "fly-best", "fly-tandem", "fly-bir", "fly-bir-billing", "fly-activity", "fly-ready",
  "fly-capital", "fly-billing-site", "fly-world-cup",
  "school-pilots", "school-prep", "school-pilot-takeoff", "school-upper-takeoff", "school-under",
  "school-takeoff-crew", "school-launch",
  "bir-aerial", "bir-dhauladhar", "bir-monastery", "bir-tea", "bir-dhauladhar-layers", "bir-barot-uhl", "bir-valley", "bir-flags",
  "camp-triund", "camp-himalaya", "camp-triund-ground",
  "trek-triund-hill", "trek-trail", "trek-ridge", "trek-barot",
  "adv-rafting", "adv-bike-uhl",
  "stay-hotels", "stay-cottage-2", "stay-cottage", "stay-suite", "stay-room", "stay-machaan",
  "ride-volvo", "ride-himsuta", "ride-sedan", "ride-suv", "ride-taxis", "ride-mcleod",
].map((name) => ({
  src: `/stock/${name}.webp`,
  tag: PHOTO_PREFIX_TAG.find(([p]) => name.startsWith(p))![1],
}));

function byTags<T>(list: T[], tags: VideoTag[], tagsOf: (item: T) => VideoTag[], count: number): T[] {
  // Items for the first tag lead, then the next tag's, then Bir scenery to fill.
  const order = [...tags, "bir" as VideoTag];
  const out: T[] = [];
  for (const tag of order) {
    for (const item of list) {
      if (out.length >= count) return out;
      if (tagsOf(item).includes(tag) && !out.includes(item)) out.push(item);
    }
  }
  return out;
}

/** Photos, videos and reels for a whole module's list page, by its tags. */
export function moduleMedia(tags: VideoTag[], counts = { photos: 7, videos: 3, reels: 6 }) {
  return {
    photos: byTags(ALL_PHOTOS, tags, (p) => [p.tag], counts.photos).map((p) => p.src),
    videos: byTags(ALL_VIDEOS, tags, (v) => v.tags, counts.videos),
    reels: byTags(ALL_REELS, tags, (v) => v.tags, counts.reels),
  };
}
