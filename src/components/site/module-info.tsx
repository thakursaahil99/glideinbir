import { Container } from "@/components/ui/card";
import { FaqBlock } from "./faq-block";
import { ScrollReveal } from "@/components/effects/scroll-reveal";
import { SEED_FAQS } from "@/content/bir-billing";

// Content + FAQ block that sits below the listings on a category page, so
// the page has real text for readers and for search engines instead of
// just a grid of cards. `faqCategory` pulls the matching seed FAQs.
export function ModuleInfo({
  heading,
  paragraphs,
  faqCategory,
}: {
  heading: string;
  paragraphs: string[];
  faqCategory?: "PARAGLIDING" | "SCHOOL" | "HOTEL" | "GENERAL";
}) {
  const faqs = faqCategory
    ? SEED_FAQS.filter((f) => f.category === faqCategory).map((f) => ({
        question: f.question,
        answer: f.answer,
      }))
    : [];

  return (
    <div className="border-t border-border bg-surface">
      <Container className="py-16">
        <ScrollReveal>
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold tracking-tight">{heading}</h2>
            <div className="mt-4 space-y-4 text-sm text-muted">
              {paragraphs.map((p) => (
                <p key={p.slice(0, 24)}>{p}</p>
              ))}
            </div>
          </div>
        </ScrollReveal>
        {faqs.length > 0 && <FaqBlock items={faqs} className="mt-12" />}
      </Container>
    </div>
  );
}
