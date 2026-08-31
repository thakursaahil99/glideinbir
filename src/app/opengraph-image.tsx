import { ImageResponse } from "next/og";

export const alt = "Glideinbir — Paragliding in Bir Billing";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #101418 0%, #1a1f26 60%, #3a2410 100%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 96, fontWeight: 700, letterSpacing: -2 }}>
          Glide<span style={{ color: "#ff6a00" }}>in</span>bir
        </div>
        <div style={{ display: "flex", marginTop: 24, fontSize: 34, color: "rgba(255,255,255,0.75)" }}>
          Paragliding · School · Hotels · Adventure · Travel
        </div>
        <div style={{ display: "flex", marginTop: 16, fontSize: 26, color: "#ff6a00" }}>
          Bir Billing, Himachal Pradesh
        </div>
      </div>
    ),
    { ...size },
  );
}
