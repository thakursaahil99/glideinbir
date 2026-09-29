"use client";

import { motion } from "framer-motion";
import { clsx } from "clsx";

// A rule that draws itself left-to-right when scrolled into view.
export function GrowLine({ className, delay = 0.2 }: { className?: string; delay?: number }) {
  return (
    <motion.div
      aria-hidden
      className={clsx("origin-left", className)}
      initial={{ scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 1.4, delay, ease: [0.16, 1, 0.3, 1] }}
    />
  );
}
