"use client";

import { useEffect } from "react";

// Registers the service worker (needed for install + offline launch).
// Rendered only on the pages that are meant to be installable — the admin
// area and /sahu — not the public marketing site.
export function PwaRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    const register = () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        /* SW is a progressive enhancement — ignore failures */
      });
    };
    if (document.readyState === "complete") register();
    else window.addEventListener("load", register, { once: true });
    return () => window.removeEventListener("load", register);
  }, []);

  return null;
}
