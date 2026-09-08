import { FaqAccordion } from "./faq-accordion";
import { JsonLd, faqPageJsonLd } from "./json-ld";

export type QA = { question: string; answer: string };

// A titled FAQ accordion + its FAQPage structured data. Used on the guide,
// the category pages and inside detail pages. Pass `schema={false}` when
// another block on the same page already emits FAQ schema (only one per
// page should).
export function FaqBlock({
  items,
  title = "Frequently asked questions",
  className,
  schema = true,
}: {
  items: QA[];
  title?: string;
  className?: string;
  schema?: boolean;
}) {
  if (items.length === 0) return null;
  const withIds = items.map((it, i) => ({ id: `faq-${i}`, ...it }));

  return (
    <div className={className}>
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="mt-5">
        <FaqAccordion items={withIds} />
      </div>
      {schema && <JsonLd data={faqPageJsonLd(items)} />}
    </div>
  );
}
