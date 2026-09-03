import { ImageResponse } from "next/og";
import { SahuAppIcon } from "@/components/sahu-app-icon";

export const dynamic = "force-static";

export function GET() {
  return new ImageResponse(<SahuAppIcon />, { width: 192, height: 192 });
}
