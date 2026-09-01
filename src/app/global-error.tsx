"use client";

import { useEffect } from "react";
import "./globals.css";

// Only fires if the ROOT layout itself throws (rare — a normal page error
// is caught by error.tsx instead). Must render its own <html>/<body> since
// this replaces the root layout entirely while active.
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("Unhandled root layout error", error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif" }}>
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            padding: "24px",
          }}
        >
          <p style={{ color: "#ff6a00", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>
            Something went wrong
          </p>
          <h1 style={{ fontSize: "28px", fontWeight: 700, marginTop: "12px" }}>Glideinbir hit a snag</h1>
          <p style={{ marginTop: "12px", maxWidth: "420px", color: "#57534e" }}>
            Please try again, or call us directly at +91 98053 38877.
          </p>
          <button
            onClick={reset}
            style={{
              marginTop: "24px",
              padding: "10px 24px",
              borderRadius: "9999px",
              background: "#ff6a00",
              color: "#fff",
              border: "none",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
