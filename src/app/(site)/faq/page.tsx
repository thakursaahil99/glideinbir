import type { Metadata } from "next";
import { faqService } from "@/server/modules/faq/service";
import { Container } from "@/components/ui/card";
import { FaqAccordion } from "@/components/site/faq-accordion";
import { JsonLd, faqPageJsonLd } from "@/components/site/json-ld";
import { SEED_FAQS } from "@/content/bir-billing";

export const metadata: Metadata = {
  title: "Frequently Asked Questions — Bir Billing Paragliding",
  description:
    "Answers about tandem paragliding, courses, hotels and booking in Bir Billing — season dates, safety, age and weight limits, how to get there, and more.",
  alternates: { canonical: "/faq" },
};

const CATEGORY_LABEL: Record<string, string> = {
  GENERAL: "General",
  PARAGLIDING: "Paragliding",
  SCHOOL: "Paragliding Courses",
  HOTEL: "Hotels",
};
const ORDER = ["GENERAL", "PARAGLIDING", "SCHOOL", "HOTEL"] as const;

export default async function FaqPage() {
  const dbFaqs = await faqService.listAllActive();

  // Admin-entered FAQs first, then the built-in seed set for that category.
  const grouped = new Map<string, { id: string; question: string; answer: string }[]>();
  for (const category of ORDER) grouped.set(category, []);
  for (const faq of dbFaqs) {
    grouped.get(faq.category)?.push({ id: faq.id, question: faq.question, answer: faq.answer });
  }
  SEED_FAQS.forEach((faq, i) => {
    grouped.get(faq.category)?.push({ id: `seed-${i}`, question: faq.question, answer: faq.answer });
  });

  const sections = ORDER.filter((c) => (grouped.get(c)?.length ?? 0) > 0);
  const allItems = sections.flatMap((c) => grouped.get(c)!);

  return (
    <Container className="py-16">
      <p className="text-sm font-semibold uppercase tracking-wider text-brand">Help</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">Frequently asked questions</h1>
      <p className="mt-3 max-w-xl text-muted">
        Everything people ask before booking a Bir Billing trip. Still stuck? Call{" "}
        <a href="tel:+919805338877" className="font-medium text-brand hover:underline">
          +91 98053 38877
        </a>{" "}
        or use the{" "}
        <a href="/contact" className="font-medium text-brand hover:underline">
          contact page
        </a>
        .
      </p>

      <div className="mt-10 space-y-10">
        {sections.map((category) => (
          <div key={category}>
            <h2 className="text-lg font-semibold">{CATEGORY_LABEL[category]}</h2>
            <div className="mt-4">
              <FaqAccordion items={grouped.get(category)!} />
            </div>
          </div>
        ))}
      </div>

      <JsonLd data={faqPageJsonLd(allItems)} />
    </Container>
  );
}
