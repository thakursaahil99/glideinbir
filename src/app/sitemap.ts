import type { MetadataRoute } from "next";
import { packageService } from "@/server/modules/paragliding/service";
import { courseService } from "@/server/modules/school/service";
import { hotelService } from "@/server/modules/hotel/service";
import { itemService } from "@/server/modules/adventure/service";
import { routeService } from "@/server/modules/travel/service";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://glideinbir.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [flights, courses, hotels, adventures, routes] = await Promise.all([
    packageService.listPublic({ page: 1, pageSize: 50 }),
    courseService.listPublic({ page: 1, pageSize: 50 }),
    hotelService.listPublic({ page: 1, pageSize: 50 }),
    itemService.listPublic({ page: 1, pageSize: 50 }),
    routeService.listPublic({ page: 1, pageSize: 50 }),
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    { url: siteUrl, changeFrequency: "daily", priority: 1 },
    { url: `${siteUrl}/paragliding`, changeFrequency: "daily", priority: 0.9 },
    { url: `${siteUrl}/school`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${siteUrl}/hotels`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${siteUrl}/adventure`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${siteUrl}/travel`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${siteUrl}/about`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${siteUrl}/contact`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${siteUrl}/faq`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${siteUrl}/terms`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${siteUrl}/privacy`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${siteUrl}/cancellation-policy`, changeFrequency: "yearly", priority: 0.3 },
  ];

  const dynamicPages: MetadataRoute.Sitemap = [
    ...flights.items.map((pkg) => ({
      url: `${siteUrl}/paragliding/${pkg.slug}`,
      lastModified: pkg.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...courses.items.map((course) => ({
      url: `${siteUrl}/school/${course.slug}`,
      lastModified: course.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...hotels.items.map((hotel) => ({
      url: `${siteUrl}/hotels/${hotel.slug}`,
      lastModified: hotel.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...adventures.items.map((item) => ({
      url: `${siteUrl}/adventure/${item.slug}`,
      lastModified: item.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
    ...routes.items.map((route) => ({
      url: `${siteUrl}/travel/${route.slug}`,
      lastModified: route.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  ];

  return [...staticPages, ...dynamicPages];
}
