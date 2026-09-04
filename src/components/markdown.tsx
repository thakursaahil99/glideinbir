"use client";

import type { ComponentPropsWithoutRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { clsx } from "clsx";

// react-markdown passes a `node` prop to every component override; it's not
// a valid DOM attribute, so strip it before spreading.
function domProps<T extends { node?: unknown }>(props: T): Omit<T, "node"> {
  const clone = { ...props };
  delete clone.node;
  return clone;
}

// Renders assistant messages as GitHub-flavoured Markdown — code blocks,
// inline code, lists, tables, links. No `prose` plugin in this project, so
// every element is styled explicitly.
export function Markdown({ children, className }: { children: string; className?: string }) {
  return (
    <div
      className={clsx(
        "space-y-2 text-sm leading-relaxed [word-break:break-word] [&_p]:m-0",
        className,
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: (p) => (
            <a
              {...domProps(p)}
              target="_blank"
              rel="noreferrer"
              className="text-brand underline underline-offset-2"
            />
          ),
          ul: (p) => <ul {...domProps(p)} className="list-disc space-y-1 pl-5" />,
          ol: (p) => <ol {...domProps(p)} className="list-decimal space-y-1 pl-5" />,
          h1: (p) => <h1 {...domProps(p)} className="mt-3 text-base font-semibold" />,
          h2: (p) => <h2 {...domProps(p)} className="mt-3 text-sm font-semibold" />,
          h3: (p) => <h3 {...domProps(p)} className="mt-2 text-sm font-semibold" />,
          strong: (p) => <strong {...domProps(p)} className="font-semibold" />,
          blockquote: (p) => (
            <blockquote {...domProps(p)} className="border-l-2 border-border pl-3 text-muted" />
          ),
          hr: () => <hr className="border-border" />,
          table: (p) => (
            <div className="overflow-x-auto">
              <table {...domProps(p)} className="w-full border-collapse text-xs" />
            </div>
          ),
          th: (p) => (
            <th
              {...domProps(p)}
              className="border border-border bg-black/5 px-2 py-1 text-left font-semibold"
            />
          ),
          td: (p) => <td {...domProps(p)} className="border border-border px-2 py-1 align-top" />,
          pre: (p) => (
            <pre
              {...domProps(p)}
              className="my-2 overflow-x-auto rounded-lg bg-ink p-3 text-xs leading-relaxed text-white"
            />
          ),
          code: (p) => {
            const { className: cls, children, ...rest } = domProps(
              p as ComponentPropsWithoutRef<"code"> & { node?: unknown },
            );
            if (/language-/.test(cls ?? "")) {
              return (
                <code {...rest} className={cls}>
                  {children}
                </code>
              );
            }
            return (
              <code {...rest} className="rounded bg-black/10 px-1 py-0.5 font-mono text-[0.85em]">
                {children}
              </code>
            );
          },
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
