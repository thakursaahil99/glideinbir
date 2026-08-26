import { clsx } from "clsx";

export function GradientOrb({
  className,
  color = "var(--color-brand)",
  size = 400,
  float = true,
}: {
  className?: string;
  color?: string;
  size?: number;
  float?: boolean;
}) {
  return (
    <div
      aria-hidden
      className={clsx("pointer-events-none absolute rounded-full blur-3xl opacity-40", float && "float-y", className)}
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
      }}
    />
  );
}
