import { faqService } from "@/server/modules/faq/service";
import { FaqBlock } from "./faq-block";
import { SEED_FAQS } from "@/content/bir-billing";

// FAQ block on a detail page. Prefers FAQs an admin linked to this exact
// item / category; if there are none, falls back to the built-in seed set
// for the category so the page is never bare. No FAQ schema here — the
// standalone /faq page owns that to avoid duplicate FAQPage markup.
export async function FaqSection({
  category,
  targetId,
}: {
  category: "PARAGLIDING" | "SCHOOL" | "HOTEL";
  targetId: string;
}) {
  const dbFaqs = await faqService.listForTarget(category, targetId);
  const items =
    dbFaqs.length > 0
      ? dbFaqs.map((f) => ({ question: f.question, answer: f.answer }))
      : SEED_FAQS.filter((f) => f.category === category).map((f) => ({
          question: f.question,
          answer: f.answer,
        }));

  if (items.length === 0) return null;

  return <FaqBlock items={items} className="mt-10 border-t border-border pt-8" schema={false} />;
}
