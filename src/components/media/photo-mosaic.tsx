import Image from "next/image";
import Link from "next/link";
import { clsx } from "clsx";

// Bento grid of photos — one big tile, a tall one, and smaller ones —
// every tile links through to the full gallery. Pure server component.
const SPANS = [
  "col-span-2 row-span-2",
  "row-span-2",
  "",
  "",
  "col-span-2",
  "",
  "",
];

export function PhotoMosaic({ photos, href = "/gallery" }: { photos: string[]; href?: string }) {
  return (
    <div className="grid auto-rows-[110px] grid-cols-2 gap-3 sm:auto-rows-[150px] md:grid-cols-4 md:auto-rows-[170px]">
      {photos.slice(0, SPANS.length).map((src, i) => (
        <Link
          key={src}
          href={href}
          className={clsx("group relative overflow-hidden rounded-2xl bg-surface shadow-md", SPANS[i])}
        >
          <Image
            src={src}
            alt=""
            fill
            sizes="(min-width: 768px) 25vw, 50vw"
            className="object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <span className="absolute inset-0 bg-gradient-to-t from-black/35 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        </Link>
      ))}
    </div>
  );
}
