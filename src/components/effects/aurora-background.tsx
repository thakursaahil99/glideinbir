import { clsx } from "clsx";

// Three large blurred gradient blobs drifting via CSS keyframes (see
// globals.css) — no JS, so it's essentially free performance-wise.
export function AuroraBackground({ className }: { className?: string }) {
  return (
    <div className={clsx("pointer-events-none absolute inset-0 overflow-hidden", className)} aria-hidden>
      <div
        className="aurora-blob aurora-blob-1 h-[60%] w-[60%] -top-[10%] -left-[10%]"
        style={{ background: "radial-gradient(circle, var(--color-brand) 0%, transparent 70%)" }}
      />
      <div
        className="aurora-blob aurora-blob-2 h-[55%] w-[55%] top-[10%] right-[-10%]"
        style={{ background: "radial-gradient(circle, #6366f1 0%, transparent 70%)" }}
      />
      <div
        className="aurora-blob aurora-blob-3 h-[50%] w-[50%] bottom-[-15%] left-[20%]"
        style={{ background: "radial-gradient(circle, #22d3ee 0%, transparent 70%)" }}
      />
    </div>
  );
}
