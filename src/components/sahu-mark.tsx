import { clsx } from "clsx";

// The Sahu Bhai mark — a paraglider wing (canopy + risers + pilot) with a
// small spark for the "assistant" idea. Drawn in `currentColor` so it can
// sit on the brand gradient in the app icons and inherit text colour in the
// UI. Kept as plain SVG elements so `next/og` (Satori) can render it too.
export function SahuMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      width="100%"
      height="100%"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* canopy */}
      <path d="M8 45 C 30 20, 70 20, 92 45 C 70 33, 30 33, 8 45 Z" fill="currentColor" />
      {/* risers */}
      <path
        d="M18 43 L49 80 M38 35 L50 78 M62 35 L51 78 M82 43 L52 80"
        stroke="currentColor"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      {/* pilot */}
      <circle cx="50" cy="84" r="6" fill="currentColor" />
      {/* spark */}
      <path
        d="M76 12 L78.4 18.6 L85 21 L78.4 23.4 L76 30 L73.6 23.4 L67 21 L73.6 18.6 Z"
        fill="currentColor"
        opacity="0.9"
      />
    </svg>
  );
}

// The mark on a brand-gradient disc — for headers, chips, launcher. Size it
// via `className` on the wrapper (e.g. "h-7 w-7").
export function SahuBadge({ className }: { className?: string }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center justify-center bg-gradient-to-br from-brand to-brand-dark text-white",
        className,
      )}
    >
      <SahuMark className="h-[62%] w-[62%]" />
    </span>
  );
}
