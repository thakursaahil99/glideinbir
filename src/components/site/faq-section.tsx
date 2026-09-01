import { faqService } from "@/server/modules/faq/service";
import { FaqAccordion } from "./faq-accordion";

export async function FaqSection({
  category,
  targetId,
}: {
  category: "PARAGLIDING" | "SCHOOL" | "HOTEL";
  targetId: string;
}) {
  const faqs = await faqService.listForTarget(category, targetId);
  if (faqs.length === 0) return null;

  return (
    <div className="mt-10 border-t border-border pt-8">
      <h2 className="text-lg font-semibold">Frequently asked questions</h2>
      <div className="mt-5">
        <FaqAccordion items={faqs} />
      </div>
    </div>
  );
}
