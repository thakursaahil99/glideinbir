import { ImageResponse } from "next/og";

export const dynamic = "force-static";

const size = 512;

// App icon for the "Sahu Bhai" PWA. Full-bleed so it also works as a
// maskable icon (the "SB" mark stays well inside the safe zone).
export function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #ff6a00, #c94f00)",
          color: "white",
          fontSize: 250,
          fontWeight: 700,
          letterSpacing: "-12px",
        }}
      >
        SB
      </div>
    ),
    { width: size, height: size },
  );
}
