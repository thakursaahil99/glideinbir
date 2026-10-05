// Pure helpers for the weekly auto-blog job: parse the model's JSON, keep
// only internal links that really exist, and reject drafts that state
// prices or contact details (those change and must come from live pages).

export type GeneratedPost = { title: string; excerpt: string; body: string };

// Models often wrap JSON in ``` fences or add a sentence around it.
export function extractJson(raw: string): unknown {
  const fenced = /```(?:json)?\s*([\s\S]*?)```/i.exec(raw);
  const candidate = fenced?.[1] ?? raw;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end <= start) throw new Error("No JSON object in model output");
  return JSON.parse(candidate.slice(start, end + 1));
}

// Turns every [text](target) whose target is not an allowed internal path
// into plain text, so the model can't link out or invent pages.
export function sanitizeLinks(body: string, allowedPaths: Set<string>): string {
  return body.replace(/\[([^\]]+)\]\(([^)\s]*)\)/g, (_m, text: string, target: string) => {
    const path = target.split("#")[0]?.split("?")[0]?.replace(/\/+$/, "") || "/";
    return allowedPaths.has(path) ? `[${text}](${path})` : text;
  });
}

// Prices, phone numbers and email addresses go stale (or are wrong), so a
// draft containing any of them is discarded rather than published.
const FORBIDDEN = [
  /₹\s?\d/,
  /\brs\.?\s?\d/i,
  /\binr\s?\d/i,
  /\b\d[\d,]*\s?(?:rupees|rs\b)/i,
  /\+?\d[\d\s-]{8,}\d/,
  /[\w.+-]+@[\w-]+\.[\w.]+/,
];

export function findForbidden(text: string): string | null {
  for (const pattern of FORBIDDEN) {
    const match = pattern.exec(text);
    if (match) return match[0];
  }
  return null;
}

export function validateGenerated(value: unknown, allowedPaths: Set<string>): GeneratedPost {
  if (!value || typeof value !== "object") throw new Error("Model output is not an object");
  const { title, excerpt, body } = value as Record<string, unknown>;
  if (typeof title !== "string" || typeof excerpt !== "string" || typeof body !== "string") {
    throw new Error("Model output is missing title, excerpt or body");
  }
  const clean = {
    title: title.trim().replace(/^#+\s*/, ""),
    excerpt: excerpt.trim(),
    body: sanitizeLinks(body.trim(), allowedPaths),
  };
  if (clean.title.length < 10 || clean.title.length > 200) throw new Error("Title length out of range");
  if (clean.excerpt.length < 40 || clean.excerpt.length > 400) throw new Error("Excerpt length out of range");
  if (clean.body.length < 1500) throw new Error("Body is too short to be a useful guide");
  const forbidden = findForbidden(`${clean.title}\n${clean.excerpt}\n${clean.body}`);
  if (forbidden) throw new Error(`Draft contains a price or contact detail: "${forbidden}"`);
  return clean;
}
