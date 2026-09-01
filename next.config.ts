import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Local dev media served from /public/uploads via the local storage driver.
      // Add Cloudinary/S3 remote patterns here once cloud storage is wired up.
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "fastly.picsum.photos" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  // No Content-Security-Policy here on purpose: Razorpay's checkout script
  // needs its own domains allowed for script/frame/connect, and getting
  // that wrong would silently break real payments — the one thing this
  // site can least afford. These four are safe, non-breaking baseline
  // hardening; add a carefully-tested CSP separately if needed later.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
