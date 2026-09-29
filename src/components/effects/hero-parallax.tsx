"use client";

import { useRef, type ReactNode } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { clsx } from "clsx";
import { usePrefersReducedMotion } from "./use-reduced-motion";

// Scroll-linked hero: as the page scrolls past, the background media sinks
// and zooms slightly while the foreground copy lifts and fades — the layered
// depth of a parallax without any per-frame React renders.
export function HeroParallax({
  media,
  overlay,
  children,
  className,
}: {
  /** Background image/video — gets the parallax sink + zoom. */
  media: ReactNode;
  /** Static layers between media and content (scrims, particles, badges). */
  overlay?: ReactNode;
  /** Foreground copy — lifts and fades out on scroll. */
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const reduce = usePrefersReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });

  const mediaY = useTransform(scrollYProgress, [0, 1], ["0%", reduce ? "0%" : "22%"]);
  const mediaScale = useTransform(scrollYProgress, [0, 1], [1, reduce ? 1 : 1.12]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -140]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.75], [1, reduce ? 1 : 0]);

  return (
    <section ref={ref} className={clsx("relative overflow-hidden", className)}>
      <motion.div className="absolute inset-0" style={{ y: mediaY, scale: mediaScale }}>
        {media}
      </motion.div>
      {overlay}
      <motion.div className="relative z-10 w-full" style={{ y: contentY, opacity: contentOpacity }}>
        {children}
      </motion.div>
    </section>
  );
}
