import { Fragment, type ReactNode } from "react";
import Link from "next/link";

// Small article renderer for blog bodies. Supports the subset of Markdown
// our content actually uses: ## / ### headings, - bullet lists, blank-line
// paragraphs, **bold** inline, and [text](/internal-path) links. Server
// component — no client JS.
const INLINE_TOKEN = /(\*\*[^*]+\*\*|\[[^\]]+\]\(\/[^)\s]*\))/g;
const LINK = /^\[([^\]]+)\]\((\/[^)\s]*)\)$/;

function inline(text: string): ReactNode {
  return text.split(INLINE_TOKEN).map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-ink">
          {part.slice(2, -2)}
        </strong>
      );
    }
    // Internal links only (must start with "/") so authored or admin
    // content can't link out to arbitrary sites.
    const link = LINK.exec(part);
    if (link?.[2]) {
      return (
        <Link key={i} href={link[2]}className="font-medium text-brand underline-offset-2 hover:underline">
          {link[1]}
        </Link>
      );
    }
    return <Fragment key={i}>{part}</Fragment>;
  });
}

export function ArticleBody({ body }: { body: string }) {
  const blocks = body.split(/\n{2,}/).map((b) => b.trim()).filter(Boolean);

  return (
    <div className="mt-8 space-y-5 text-[15px] leading-relaxed text-ink/90">
      {blocks.map((block, i) => {
        if (block.startsWith("### ")) {
          return (
            <h3 key={i} className="pt-2 text-lg font-semibold text-ink">
              {inline(block.slice(4))}
            </h3>
          );
        }
        if (block.startsWith("## ")) {
          return (
            <h2 key={i} className="pt-4 text-xl font-bold tracking-tight text-ink">
              {inline(block.slice(3))}
            </h2>
          );
        }
        const lines = block.split("\n");
        if (lines.every((l) => l.startsWith("- "))) {
          return (
            <ul key={i} className="list-disc space-y-1.5 pl-5">
              {lines.map((l, j) => (
                <li key={j}>{inline(l.slice(2))}</li>
              ))}
            </ul>
          );
        }
        return (
          <p key={i} className="whitespace-pre-line">
            {inline(block)}
          </p>
        );
      })}
    </div>
  );
}
