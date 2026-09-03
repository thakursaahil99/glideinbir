import { ImageResponse } from "next/og";
import { SahuAppIcon } from "@/components/sahu-app-icon";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// apple-touch-icon — used by iOS when a page is added to the Home Screen.
export default function AppleIcon() {
  return new ImageResponse(<SahuAppIcon />, { ...size });
}
