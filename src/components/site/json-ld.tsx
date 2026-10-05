import { SITE_URL } from "@/lib/seo";

// Drop a JSON-LD structured-data block into a page. Server component —
// renders a <script type="application/ld+json">. Google reads this for
// rich results (FAQ accordions, breadcrumbs, article cards).
export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function faqPageJsonLd(items: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((it) => ({
      "@type": "Question",
      name: it.question,
      acceptedAnswer: { "@type": "Answer", text: it.answer },
    })),
  };
}

export function breadcrumbJsonLd(siteUrl: string, crumbs: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: `${siteUrl}${c.path}`,
    })),
  };
}

type Rating = { average: number | null; count: number } | null | undefined;

// Stars in search results only for real, approved reviews — never invent a
// rating, Google treats made-up aggregateRating as a spam signal.
function aggregateRating(rating: Rating) {
  if (!rating || !rating.average || rating.count < 1) return undefined;
  return {
    "@type": "AggregateRating",
    ratingValue: Number(rating.average.toFixed(1)),
    reviewCount: rating.count,
    bestRating: 5,
    worstRating: 1,
  };
}

function offer(url: string, price: number | string) {
  return {
    "@type": "Offer",
    url,
    price: Number(price).toFixed(2),
    priceCurrency: "INR",
    availability: "https://schema.org/InStock",
  };
}

// Paragliding flights, adventures and travel routes: a bookable Product
// with a price Offer, which is what makes the price show in Google results.
export function productJsonLd(o: {
  url: string;
  name: string;
  description: string;
  images: string[];
  price: number | string;
  category: string;
  rating?: Rating;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: o.name,
    description: o.description,
    image: o.images,
    category: o.category,
    brand: { "@type": "Brand", name: "Glideinbir" },
    offers: offer(o.url, o.price),
    aggregateRating: aggregateRating(o.rating),
  };
}

export function courseJsonLd(o: {
  url: string;
  name: string;
  description: string;
  images: string[];
  fee: number | string;
  durationDays: number;
  rating?: Rating;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    name: o.name,
    description: o.description,
    image: o.images,
    provider: { "@type": "Organization", name: "Glideinbir", url: SITE_URL },
    offers: offer(o.url, o.fee),
    hasCourseInstance: {
      "@type": "CourseInstance",
      courseMode: "onsite",
      courseWorkload: `P${o.durationDays}D`,
    },
    aggregateRating: aggregateRating(o.rating),
  };
}

export function hotelJsonLd(o: {
  url: string;
  name: string;
  description: string;
  images: string[];
  address: string;
  city: string;
  latitude?: number | null;
  longitude?: number | null;
  checkInTime: string;
  checkOutTime: string;
  cheapestPrice?: number | null;
  rating?: Rating;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Hotel",
    name: o.name,
    description: o.description,
    url: o.url,
    image: o.images,
    address: {
      "@type": "PostalAddress",
      streetAddress: o.address,
      addressLocality: o.city,
      addressRegion: "Himachal Pradesh",
      addressCountry: "IN",
    },
    geo:
      o.latitude != null && o.longitude != null
        ? { "@type": "GeoCoordinates", latitude: o.latitude, longitude: o.longitude }
        : undefined,
    checkinTime: o.checkInTime,
    checkoutTime: o.checkOutTime,
    priceRange: o.cheapestPrice ? `From ₹${Math.round(o.cheapestPrice)} per night` : undefined,
    aggregateRating: aggregateRating(o.rating),
  };
}
