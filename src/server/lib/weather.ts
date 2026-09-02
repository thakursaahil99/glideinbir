// Open-Meteo — free, keyless, no signup required (unlike most weather
// APIs), which is exactly why it's used here instead of asking for an
// OpenWeatherMap-style account. Coordinates are Billing's takeoff point.
const BILLING_LAT = 32.03;
const BILLING_LON = 76.73;

// WMO weather codes, the small subset Open-Meteo actually returns for this
// region — see https://open-meteo.com/en/docs for the full table.
const WEATHER_LABELS: Record<number, string> = {
  0: "Clear sky",
  1: "Mostly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Foggy",
  48: "Foggy",
  51: "Light drizzle",
  53: "Drizzle",
  55: "Heavy drizzle",
  61: "Light rain",
  63: "Rain",
  65: "Heavy rain",
  71: "Light snow",
  73: "Snow",
  75: "Heavy snow",
  80: "Rain showers",
  81: "Rain showers",
  82: "Heavy showers",
  95: "Thunderstorm",
};

export type FlyingConditions = {
  temperatureC: number;
  windKmh: number;
  conditionLabel: string;
  flyability: "good" | "moderate" | "poor";
  flyabilityLabel: string;
};

// A rough, informational heuristic only — wind speed at ground level isn't
// the same as conditions at Billing's launch site, and the pilot's own
// call always overrides this. Framed that way in the UI, not as a
// go/no-go guarantee.
function classifyFlyability(windKmh: number): { flyability: FlyingConditions["flyability"]; label: string } {
  if (windKmh < 15) return { flyability: "good", label: "Looks good for flying" };
  if (windKmh < 25) return { flyability: "moderate", label: "Moderate wind — pilot's call" };
  return { flyability: "poor", label: "High wind — flights may be delayed" };
}

export async function getFlyingConditions(): Promise<FlyingConditions | null> {
  try {
    const url = new URL("https://api.open-meteo.com/v1/forecast");
    url.searchParams.set("latitude", String(BILLING_LAT));
    url.searchParams.set("longitude", String(BILLING_LON));
    url.searchParams.set("current", "temperature_2m,wind_speed_10m,weather_code");
    url.searchParams.set("timezone", "Asia/Kolkata");

    const res = await fetch(url, { next: { revalidate: 900 } }); // cache 15 min
    if (!res.ok) return null;
    const data = await res.json();
    const windKmh = Math.round(data.current.wind_speed_10m);
    const { flyability, label } = classifyFlyability(windKmh);

    return {
      temperatureC: Math.round(data.current.temperature_2m),
      windKmh,
      conditionLabel: WEATHER_LABELS[data.current.weather_code] ?? "—",
      flyability,
      flyabilityLabel: label,
    };
  } catch {
    return null; // weather is a nice-to-have — never break the page over it
  }
}
