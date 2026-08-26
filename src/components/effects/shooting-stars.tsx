const STARS = [
  { top: "10%", left: "70%", delay: "0s", duration: "3.2s" },
  { top: "25%", left: "90%", delay: "1.4s", duration: "4s" },
  { top: "5%", left: "40%", delay: "2.6s", duration: "3.6s" },
];

// A few diagonal light-streak divs, staggered so they don't all fire at
// once. Pure CSS (see .shooting-star in globals.css) — cheap.
export function ShootingStars({ className }: { className?: string }) {
  return (
    <div className={className} aria-hidden style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      {STARS.map((star, i) => (
        <span
          key={i}
          className="shooting-star"
          style={{ top: star.top, left: star.left, animationDelay: star.delay, animationDuration: star.duration }}
        />
      ))}
    </div>
  );
}
