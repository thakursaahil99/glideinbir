import type { Metadata } from "next";

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://glideinbir.vercel.app";

// Uploaded media is stored as "/uploads/…" while stock photos are already
// absolute — schema.org and Open Graph both need absolute URLs.
export function absoluteUrl(url: string): string {
  if (/^https?:\/\//i.test(url)) return url;
  return `${SITE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
}

// Setting openGraph on a page replaces the layout's whole openGraph object
// (Next merges metadata shallowly), so siteName/locale/type are repeated
// here to keep every shared link a complete card with its own photo.
export function pageOpenGraph(opts: {
  title: string;
  description: string;
  path: string;
  image?: string;
}): NonNullable<Metadata["openGraph"]> {
  return {
    type: "website",
    siteName: "Glideinbir",
    locale: "en_IN",
    title: opts.title,
    description: opts.description,
    url: absoluteUrl(opts.path),
    ...(opts.image ? { images: [{ url: absoluteUrl(opts.image) }] } : {}),
  };
}
