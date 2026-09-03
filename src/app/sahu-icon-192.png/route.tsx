import { ImageResponse } from "next/og";

export const dynamic = "force-static";

const size = 192;

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
          fontSize: 94,
          fontWeight: 700,
          letterSpacing: "-5px",
        }}
      >
        SB
      </div>
    ),
    { width: size, height: size },
  );
}
