import { requireRole } from "@/server/auth/guards";
import { withErrorHandling, apiSuccess } from "@/server/lib/api-response";
import { submitUrlsToIndexNow } from "@/server/lib/indexnow";
import { env } from "@/config/env";
import { packageService } from "@/server/modules/paragliding/service";
import { courseService, instructorService } from "@/server/modules/school/service";
import { hotelService } from "@/server/modules/hotel/service";
import { itemService } from "@/server/modules/adventure/service";
import { routeService } from "@/server/modules/travel/service";
import { blogService } from "@/server/modules/blog/service";

const STATIC_PATHS = [
  "/",
  "/paragliding",
  "/school",
  "/school/instructors",
  "/hotels",
  "/adventure",
  "/travel",
  "/about",
  "/contact",
  "/faq",
  "/blog",
  "/terms",
  "/privacy",
  "/cancellation-policy",
];

// Pushes every current public URL to IndexNow (Bing/Yandex/Seznam/Naver —
// not Google, which doesn't participate in the protocol) so it doesn't
// have to wait for those crawlers' next natural pass. Safe to re-run any
// time content changes; there's no rate limit downside to resubmitting.
export const POST = withErrorHandling(async () => {
  await requireRole("SUPER_ADMIN");

  const [flights, courses, hotels, adventures, routes, instructors, posts] = await Promise.all([
    packageService.listPublic({ page: 1, pageSize: 50 }),
    courseService.listPublic({ page: 1, pageSize: 50 }),
    hotelService.listPublic({ page: 1, pageSize: 50 }),
    itemService.listPublic({ page: 1, pageSize: 50 }),
    routeService.listPublic({ page: 1, pageSize: 50 }),
    instructorService.listPublic(),
    blogService.listPublic(),
  ]);

  const urls = [
    ...STATIC_PATHS,
    ...flights.items.map((p) => `/paragliding/${p.slug}`),
    ...courses.items.map((c) => `/school/${c.slug}`),
    ...hotels.items.map((h) => `/hotels/${h.slug}`),
    ...adventures.items.map((i) => `/adventure/${i.slug}`),
    ...routes.items.map((r) => `/travel/${r.slug}`),
    ...instructors.map((i) => `/school/instructors/${i.slug}`),
    ...posts.map((p) => `/blog/${p.slug}`),
  ].map((path) => `${env.NEXT_PUBLIC_SITE_URL}${path}`);

  const result = await submitUrlsToIndexNow(urls);
  return apiSuccess({ submitted: urls.length, ...result });
});
