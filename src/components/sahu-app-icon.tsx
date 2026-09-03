import { SahuMark } from "@/components/sahu-mark";

// The installable-app icon: the Sahu Bhai mark on the brand gradient,
// full-bleed so it doubles as a maskable icon. Inline styles only — this is
// rendered to PNG by `next/og` (Satori), which ignores Tailwind classes.
export function SahuAppIcon() {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #ff7a1a 0%, #ff6a00 45%, #c94f00 100%)",
        color: "#ffffff",
      }}
    >
      <div style={{ display: "flex", width: "66%", height: "66%" }}>
        <SahuMark />
      </div>
    </div>
  );
}
