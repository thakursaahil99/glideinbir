"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { clsx } from "clsx";

export type FaqItem = { id: string; question: string; answer: string };

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className="divide-y divide-border rounded-2xl border border-border">
      {items.map((item) => {
        const open = openId === item.id;
        return (
          <div key={item.id}>
            <button
              type="button"
              onClick={() => setOpenId(open ? null : item.id)}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-medium"
            >
              {item.question}
              <ChevronDown
                className={clsx("h-4 w-4 shrink-0 text-muted transition-transform", open && "rotate-180")}
              />
            </button>
            {open && <p className="px-5 pb-4 text-sm text-muted">{item.answer}</p>}
          </div>
        );
      })}
    </div>
  );
}
