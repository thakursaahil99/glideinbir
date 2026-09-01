import type { Metadata } from "next";
import { faqService } from "@/server/modules/faq/service";
import { Container } from "@/components/ui/card";
import { FaqAccordion } from "@/components/site/faq-accordion";

export const metadata: Metadata = {
  title: "Frequently Asked Questions — Glideinbir",
  description:
    "Answers to common questions about paragliding, the paragliding school, hotels, and booking with Glideinbir in Bir Billing.",
  alternates: { canonical: "/faq" },
};

const CATEGORY_LABEL: Record<string, string> = {
  GENERAL: "General",
  PARAGLIDING: "Paragliding",
  SCHOOL: "Paragliding School",
  HOTEL: "Hotels",
};

export default async function FaqPage() {
  const faqs = await faqService.listAllActive();

  const grouped = new Map<string, typeof faqs>();
  for (const faq of faqs) {
    const list = grouped.get(faq.category) ?? [];
    list.push(faq);
    grouped.set(faq.category, list);
  }

  return (
    <Container className="py-16">
      <p className="text-sm font-semibold uppercase tracking-wider text-brand">Help</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">Frequently asked questions</h1>
      <p className="mt-3 max-w-xl text-muted">
        Can&apos;t find your answer here? Call us at{" "}
        <a href="tel:+919805338877" className="font-medium text-brand hover:underline">
          +91 98053 38877
        </a>{" "}
        or send a message on our{" "}
        <a href="/contact" className="font-medium text-brand hover:underline">
          Contact page
        </a>
        .
      </p>

      {grouped.size === 0 ? (
        <p className="mt-10 text-muted">Nothing here yet — check back soon.</p>
      ) : (
        <div className="mt-10 space-y-10">
          {["GENERAL", "PARAGLIDING", "SCHOOL", "HOTEL"]
            .filter((category) => grouped.has(category))
            .map((category) => (
              <div key={category}>
                <h2 className="text-lg font-semibold">{CATEGORY_LABEL[category]}</h2>
                <div className="mt-4">
                  <FaqAccordion items={grouped.get(category)!} />
                </div>
              </div>
            ))}
        </div>
      )}
    </Container>
  );
}
