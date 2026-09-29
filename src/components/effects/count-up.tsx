"use client";

import { useEffect, useRef } from "react";
import { animate, useInView } from "framer-motion";
import { usePrefersReducedMotion } from "./use-reduced-motion";

// Counts a stat up from zero the first time it scrolls into view. Takes the
// display string as-is ("10,000+", "4.8/5", "~2,400 m") and only animates
// the number inside it, so prefixes/suffixes and comma style survive. The
// server renders the final value, so crawlers and no-JS see the real stat.
export function CountUp({
  value,
  duration = 2,
  className,
}: {
  value: string;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduce = usePrefersReducedMotion();

  const match = value.match(/^([^\d]*)([\d,]*\.?\d+)(.*)$/);

  useEffect(() => {
    const el = ref.current;
    if (!el || !match || reduce) return;
    const [, prefix = "", raw = "0", suffix = ""] = match;
    const target = Number(raw.replace(/,/g, ""));
    const decimals = raw.split(".")[1]?.length ?? 0;
    const grouped = raw.includes(",");
    const format = (n: number) =>
      prefix +
      n.toLocaleString("en-US", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
        useGrouping: grouped,
      }) +
      suffix;

    if (!inView) {
      el.textContent = format(0);
      return;
    }
    const controls = animate(0, target, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => {
        el.textContent = format(v);
      },
    });
    return () => controls.stop();
    // `match` is derived from `value`; depending on value is enough.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, reduce, value, duration]);

  return (
    <span ref={ref} className={className}>
      {value}
    </span>
  );
}
