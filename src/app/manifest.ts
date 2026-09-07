import type { MetadataRoute } from "next";

// Served at /manifest.webmanifest and linked site-wide from the root layout,
// so any page can be installed. However installed, the app opens at
// `start_url` (/sahu) — a full-screen Sahu Bhai that works for everyone.
// /app is the shareable "get the app" landing page.
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/sahu",
    name: "Sahu Bhai",
    short_name: "Sahu Bhai",
    description:
      "Chat assistant for the Glideinbir admin — run admin tasks and ask general questions from your phone or desktop.",
    start_url: "/sahu",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#ffffff",
    theme_color: "#ff6a00",
    icons: [
      { src: "/sahu-icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/sahu-icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/sahu-icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
