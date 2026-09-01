import { prisma } from "@/server/db/prisma";

export type SearchResult = {
  type: "PARAGLIDING" | "SCHOOL" | "HOTEL" | "ADVENTURE" | "TRAVEL";
  typeLabel: string;
  title: string;
  href: string;
  image: string;
  meta: string;
};

// A simple case-insensitive title/name match across all five bookable
// modules — no full-text search infra, just enough for "find the thing I
// remember the name of" without leaving the site.
export const searchService = {
  async search(query: string): Promise<SearchResult[]> {
    const q = query.trim();
    if (q.length < 2) return [];

    const [packages, courses, hotels, items, routes] = await Promise.all([
      prisma.paraglidingPackage.findMany({
        where: { isActive: true, title: { contains: q, mode: "insensitive" } },
        include: { media: { orderBy: { order: "asc" }, take: 1 } },
        take: 10,
      }),
      prisma.schoolCourse.findMany({
        where: { isActive: true, title: { contains: q, mode: "insensitive" } },
        include: { media: { orderBy: { order: "asc" }, take: 1 } },
        take: 10,
      }),
      prisma.hotel.findMany({
        where: { isActive: true, name: { contains: q, mode: "insensitive" } },
        include: { media: { orderBy: { order: "asc" }, take: 1 } },
        take: 10,
      }),
      prisma.adventureItem.findMany({
        where: { isActive: true, title: { contains: q, mode: "insensitive" } },
        include: { media: { orderBy: { order: "asc" }, take: 1 } },
        take: 10,
      }),
      prisma.travelRoute.findMany({
        where: { isActive: true, title: { contains: q, mode: "insensitive" } },
        include: { media: { orderBy: { order: "asc" }, take: 1 } },
        take: 10,
      }),
    ]);

    return [
      ...packages.map((p) => ({
        type: "PARAGLIDING" as const,
        typeLabel: "Paragliding",
        title: p.title,
        href: `/paragliding/${p.slug}`,
        image: p.media[0]?.url ?? "/placeholder.svg",
        meta: p.location,
      })),
      ...courses.map((c) => ({
        type: "SCHOOL" as const,
        typeLabel: "School",
        title: c.title,
        href: `/school/${c.slug}`,
        image: c.media[0]?.url ?? "/placeholder.svg",
        meta: `${c.durationDays} days`,
      })),
      ...hotels.map((h) => ({
        type: "HOTEL" as const,
        typeLabel: "Hotel",
        title: h.name,
        href: `/hotels/${h.slug}`,
        image: h.media[0]?.url ?? "/placeholder.svg",
        meta: h.city,
      })),
      ...items.map((i) => ({
        type: "ADVENTURE" as const,
        typeLabel: "Adventure",
        title: i.title,
        href: `/adventure/${i.slug}`,
        image: i.media[0]?.url ?? "/placeholder.svg",
        meta: i.location,
      })),
      ...routes.map((r) => ({
        type: "TRAVEL" as const,
        typeLabel: "Travel",
        title: r.title,
        href: `/travel/${r.slug}`,
        image: r.media[0]?.url ?? "/placeholder.svg",
        meta: `${r.fromLocation} → ${r.toLocation}`,
      })),
    ];
  },
};
