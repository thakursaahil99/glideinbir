import { getSkyNow } from "@/server/lib/weather";

// Live sky over Bir Billing for the site-wide weather overlay. Regenerated
// at most once a minute (the Open-Meteo call itself is cached for 5), so
// visitors share one cached response and an admin override shows up fast —
// saving one also revalidates this path straight away.
export const revalidate = 60;

export async function GET() {
  const sky = await getSkyNow();
  return Response.json(
    sky ?? { effect: "none", intensity: "light", level: 0, label: "—", temperatureC: null, isDay: true, observedAt: null },
  );
}
