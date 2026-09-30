import { getSkyNow } from "@/server/lib/weather";

// Live sky over Bir Billing for the site-wide weather overlay. Regenerated
// at most every 15 minutes, so visitors share one cached upstream call.
export const revalidate = 900;

export async function GET() {
  const sky = await getSkyNow();
  return Response.json(
    sky ?? { effect: "none", intensity: "light", level: 0, label: "—", temperatureC: null, isDay: true, observedAt: null },
  );
}
