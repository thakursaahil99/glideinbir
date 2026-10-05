import { prisma } from "@/server/db/prisma";
import { env } from "@/config/env";
import { logger } from "@/server/lib/logger";
import { slugify } from "@/lib/slugify";
import { SEED_POSTS } from "@/content/blog";
import { chatCompletion, isSahuBhaiConfigured } from "@/server/modules/assistant/client";
import { blogService } from "./service";
import { extractJson, validateGenerated } from "./auto-writer-format";

// Weekly job: Sahu Bhai's LLM writes one new Bir Billing guide and saves it
// as a Draft (or publishes it when BLOG_AUTOPUBLISH=true). It shows up in
// Admin → Blog like any other post.

type Topic = { slug: string; title: string; angle: string };

// Evergreen, search-shaped topics. Used in order, skipping any whose slug
// already exists. Once they run out, the model proposes new ones itself.
const TOPICS: Topic[] = [
  { slug: "tandem-vs-solo-paragliding", title: "Tandem vs Solo Paragliding: What Is the Difference?", angle: "Explain the difference for a beginner and when each makes sense." },
  { slug: "how-long-is-a-paragliding-flight-in-bir-billing", title: "How Long Is a Paragliding Flight in Bir Billing?", angle: "Air time versus total time for the day, and what changes the length of a flight." },
  { slug: "paragliding-weather-cancellations-explained", title: "Why Paragliding Flights Get Cancelled (and What Happens Next)", angle: "Wind, thermals, cloud and rain; how pilots decide and how rescheduling works." },
  { slug: "bir-billing-for-solo-travellers", title: "Bir Billing for Solo Travellers: A Practical Guide", angle: "Staying, meeting people, getting around and flying when travelling alone." },
  { slug: "bir-billing-for-couples-and-honeymoon", title: "Bir Billing for Couples: A Slow Trip Plan", angle: "A romantic, unhurried plan around a tandem flight, cafes and views." },
  { slug: "bir-billing-with-family-and-kids", title: "Bir Billing with Family and Kids: What Works", angle: "What children and older relatives can do, and calmer alternatives to flying." },
  { slug: "bir-billing-in-winter", title: "Bir Billing in Winter: Flying, Cold and What to Pack", angle: "Winter conditions, whether flights run, and how to dress." },
  { slug: "bir-billing-in-summer-may-june", title: "Bir Billing in May and June: Heat, Thermals and Crowds", angle: "Summer flying conditions, best times of day and what to expect." },
  { slug: "bir-billing-cafes-and-food-guide", title: "Where to Eat in Bir: Cafes, Tibetan Food and Local Meals", angle: "The kinds of food available in Bir and how to pick a good place; no specific prices." },
  { slug: "tibetan-colony-and-monasteries-in-bir", title: "The Tibetan Colony and Monasteries Around Bir", angle: "A respectful visitor guide to the Tibetan settlement and the main monasteries." },
  { slug: "learn-paragliding-as-a-beginner-in-bir-billing", title: "Learning Paragliding as a Beginner in Bir Billing", angle: "What the first days of a course look like and how to prepare." },
  { slug: "how-to-choose-a-paragliding-school-in-bir", title: "How to Choose a Paragliding School in Bir Billing", angle: "Questions to ask about instructors, equipment, batch size and certification." },
  { slug: "fear-of-heights-and-paragliding", title: "Afraid of Heights? What Paragliding Actually Feels Like", angle: "An honest explanation of why many people with a fear of heights still enjoy it." },
  { slug: "bir-billing-camping-guide", title: "Camping in Bir Billing: What to Know Before You Go", angle: "Types of camps, what to check, and the season to choose." },
  { slug: "delhi-to-bir-billing-weekend-trip", title: "Delhi to Bir Billing: A Weekend Trip Plan", angle: "A two-night plan built around an overnight bus and a morning flight." },
  { slug: "chandigarh-to-bir-billing-road-trip", title: "Chandigarh to Bir Billing: Road Trip Guide", angle: "The route, stops and how to time the drive." },
  { slug: "bir-billing-and-dharamshala-combined-trip", title: "Combining Bir Billing and Dharamshala in One Trip", angle: "How to split days between the two and the practical travel between them." },
  { slug: "baijnath-temple-and-palampur-day-trip", title: "Baijnath, Palampur and Andretta: A Day Trip from Bir", angle: "The nearby temple, tea gardens and artists' village, with practical tips." },
  { slug: "bir-billing-packing-list-by-season", title: "Bir Billing Packing List by Season", angle: "What to pack for each season, beyond the flight itself." },
  { slug: "gopro-video-and-photography-in-bir-billing", title: "Photos and Video in Bir Billing: Getting Good Shots", angle: "In-flight video versus your own camera, and the best viewpoints on the ground." },
  { slug: "bir-billing-on-a-budget", title: "Bir Billing on a Budget: Where You Can Save", angle: "Where trips cost less and where it is not worth cutting corners; no specific prices." },
  { slug: "paragliding-vs-other-adventure-sports-in-himachal", title: "Paragliding vs Other Adventure Sports in Himachal", angle: "How paragliding compares with rafting, trekking and skiing for a first-time adventurer." },
];

// Site pages the model may link to. Blog links are added at runtime.
const STATIC_LINK_TARGETS = [
  "/paragliding", "/courses", "/hotels", "/adventure", "/travel",
  "/bir-billing", "/faq", "/contact", "/blog",
];

const SYSTEM_PROMPT = `You write helpful, honest travel guides for Glideinbir, a booking platform for paragliding, courses, hotels, adventure and travel in Bir Billing, Himachal Pradesh, India.

Rules:
- Write in clear, plain English for a visitor planning a trip. No hype, no clickbait.
- 700 to 1000 words.
- Use ONLY well-established general facts. Never state prices, fees, phone numbers, email addresses, exact opening times, statistics or dates. If something varies, say it varies and point the reader to the relevant Glideinbir page.
- Never invent specific businesses, people, awards or records.
- Format: "## " headings, "### " sub-headings, "- " bullet lists, **bold**, blank lines between paragraphs. No H1, no tables, no emojis, no HTML.
- Add 3 to 6 internal links using the form [anchor text](/path). Use ONLY the paths you are given. Never link to any other site.
- End with a short, natural pointer to the most relevant Glideinbir page.
Reply with ONLY a JSON object: {"title": string, "excerpt": string, "body": string}. The excerpt is 1 to 2 sentences (max 300 characters) and the body is the Markdown article.`;

async function usedSlugs(): Promise<Set<string>> {
  const rows = await prisma.blogPost.findMany({ select: { slug: true } });
  return new Set([...rows.map((r) => r.slug), ...SEED_POSTS.map((p) => p.slug)]);
}

async function proposeTopic(existingTitles: string[]): Promise<Topic> {
  const reply = await chatCompletion({
    messages: [
      {
        role: "system",
        content:
          'You plan blog topics for a Bir Billing paragliding travel site. Reply with ONLY JSON: {"title": string, "angle": string}. Pick one evergreen topic a traveller would search for that is NOT already covered.',
      },
      { role: "user", content: `Existing posts:\n${existingTitles.map((t) => `- ${t}`).join("\n")}` },
    ],
  });
  const json = extractJson(reply.content ?? "") as { title?: unknown; angle?: unknown };
  if (typeof json.title !== "string" || typeof json.angle !== "string") throw new Error("Bad topic proposal");
  return { slug: slugify(json.title), title: json.title, angle: json.angle };
}

export type AutoBlogResult =
  | { status: "skipped"; reason: string }
  | { status: "created"; slug: string; published: boolean };

export async function writeNextBlogPost(): Promise<AutoBlogResult> {
  if (!isSahuBhaiConfigured()) return { status: "skipped", reason: "Sahu Bhai LLM key is not configured" };

  const used = await usedSlugs();
  const titles = [...SEED_POSTS.map((p) => p.title), ...(await prisma.blogPost.findMany({ select: { title: true } })).map((p) => p.title)];

  let topic = TOPICS.find((t) => !used.has(t.slug));
  if (!topic) {
    topic = await proposeTopic(titles);
    if (used.has(topic.slug)) return { status: "skipped", reason: `Proposed topic "${topic.slug}" already exists` };
  }

  const allowed = new Set([
    ...STATIC_LINK_TARGETS,
    ...[...used].map((slug) => `/blog/${slug}`),
  ]);

  const reply = await chatCompletion({
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: `Topic: ${topic.title}\nAngle: ${topic.angle}\n\nAllowed internal link paths:\n${[...allowed].map((p) => `- ${p}`).join("\n")}`,
      },
    ],
  });

  const post = validateGenerated(extractJson(reply.content ?? ""), allowed);
  const published = env.BLOG_AUTOPUBLISH === "true";
  const created = await blogService.create({ ...post, slug: topic.slug, isActive: published });
  logger.info("Auto blog: post written", { slug: created.slug, published });
  return { status: "created", slug: created.slug, published };
}
