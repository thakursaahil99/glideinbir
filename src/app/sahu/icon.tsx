import { ImageResponse } from "next/og";
import { SahuAppIcon } from "@/components/sahu-app-icon";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

// Favicon for the /sahu route (and the installed app's browser-tab icon).
export default function Icon() {
  return new ImageResponse(<SahuAppIcon />, { ...size });
}
