import { prisma } from "@/server/db/prisma";

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
  56: "Freezing drizzle",
  57: "Freezing drizzle",
  51: "Light drizzle",
  53: "Drizzle",
  55: "Heavy drizzle",
  61: "Light rain",
  63: "Rain",
  65: "Heavy rain",
  66: "Freezing rain",
  67: "Freezing rain",
  71: "Light snow",
  73: "Snow",
  75: "Heavy snow",
  77: "Snow grains",
  80: "Rain showers",
  81: "Rain showers",
  82: "Heavy showers",
  85: "Snow showers",
  86: "Heavy snow showers",
  95: "Thunderstorm",
  96: "Thunderstorm with hail",
  99: "Thunderstorm with hail",
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

    const res = await fetch(url, { next: { revalidate: 300 } }); // cache 5 min
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

// --- Site-wide weather overlay ---------------------------------------------
// Drives the rain / snow / fog layer drawn over every page, so the site
// shows what the sky over Bir is actually doing right now.

export type SkyEffect = "sun" | "night" | "clouds" | "rain" | "snow" | "storm" | "fog" | "none";
export type SkyIntensity = "light" | "moderate" | "heavy";

export type SkyNow = {
  effect: SkyEffect;
  intensity: SkyIntensity;
  /** 0…1 — how much to draw. From measured rain/snow when there is any, else from the weather code. */
  level: number;
  label: string;
  temperatureC: number | null;
  isDay: boolean;
  observedAt: string;
};

const LEVEL: Record<SkyIntensity, number> = { light: 0.3, moderate: 0.6, heavy: 1 };

// WMO code → overlay. Drizzle and freezing rain draw as rain; showers and
// plain rain scale by the code's own light / moderate / heavy step. Clear
// skies are sunshine by day and a starry sky by night — unless the model's
// own cloud cover says otherwise: it often reports code 0/1 over Bir while
// cloud_cover is well up, so that number gets the final say on clouds.
function skyFromCode(code: number, isDay: boolean, cloudCover: number): { effect: SkyEffect; intensity: SkyIntensity } {
  if (code <= 2 && cloudCover >= 70) return { effect: "clouds", intensity: "heavy" };
  if (code <= 1 && cloudCover >= 40) return { effect: "clouds", intensity: "light" };
  if (code >= 95) return { effect: "storm", intensity: code === 95 ? "moderate" : "heavy" };
  if ([71, 77, 85].includes(code)) return { effect: "snow", intensity: "light" };
  if (code === 73) return { effect: "snow", intensity: "moderate" };
  if ([75, 86].includes(code)) return { effect: "snow", intensity: "heavy" };
  if ([51, 53, 56, 61, 80].includes(code)) return { effect: "rain", intensity: "light" };
  if ([55, 57, 63, 66, 81].includes(code)) return { effect: "rain", intensity: "moderate" };
  if ([65, 67, 82].includes(code)) return { effect: "rain", intensity: "heavy" };
  if (code === 45 || code === 48) return { effect: "fog", intensity: "moderate" };
  if (code === 2) return { effect: "clouds", intensity: "light" };
  if (code === 3) return { effect: "clouds", intensity: "heavy" };
  // 0 clear, 1 mostly clear
  return { effect: isDay ? "sun" : "night", intensity: code === 0 ? "heavy" : "moderate" };
}

// Measured precipitation → 0…1. Open-Meteo's "current" amounts cover the
// last 15 minutes, so ×4 gives an hourly rate: ~0.5 mm/h is a drizzle,
// ~8 mm/h and up is a downpour. Snow is in cm, ~3 cm/h is heavy.
function levelFromAmount(effect: SkyEffect, rainMm: number, snowCm: number): number | null {
  if ((effect === "rain" || effect === "storm") && rainMm > 0) {
    return Math.min(1, Math.max(0.15, (rainMm * 4) / 8));
  }
  if (effect === "snow" && snowCm > 0) return Math.min(1, Math.max(0.15, (snowCm * 4) / 3));
  return null;
}

// --- Manual override --------------------------------------------------------
// The forecast model can't see the local clouds that build over Bir, so
// staff on the ground can set what the sky is really doing from the admin
// dashboard. It expires on its own and the site goes back to live data.

export const SKY_OVERRIDE_KEY = "weather_override";
export const SKY_OVERRIDE_EFFECTS = ["sun", "night", "clouds", "rain", "snow", "storm", "fog"] as const;

export type SkyOverride = {
  effect: (typeof SKY_OVERRIDE_EFFECTS)[number];
  intensity: SkyIntensity;
  until: string; // ISO
  setBy: string;
};

const OVERRIDE_LABELS: Record<SkyOverride["effect"], string> = {
  sun: "Sunny",
  night: "Clear night",
  clouds: "Cloudy",
  rain: "Rain",
  snow: "Snow",
  storm: "Thunderstorm",
  fog: "Foggy",
};

export async function getSkyOverride(): Promise<SkyOverride | null> {
  try {
    const row = await prisma.siteSetting.findUnique({ where: { key: SKY_OVERRIDE_KEY } });
    const value = row?.value as SkyOverride | null | undefined;
    if (!value?.until || new Date(value.until).getTime() <= Date.now()) return null;
    return value;
  } catch {
    return null; // DB hiccup — fall back to live data rather than no weather
  }
}

async function fetchCurrent(fields: string) {
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", String(BILLING_LAT));
  url.searchParams.set("longitude", String(BILLING_LON));
  url.searchParams.set("current", fields);
  url.searchParams.set("timezone", "Asia/Kolkata");
  // Open-Meteo refreshes "current" every 15 minutes; checking every 5 means
  // a new reading reaches the site within ~5 min of being published.
  const res = await fetch(url, { next: { revalidate: 300 } });
  if (!res.ok) return null;
  return (await res.json()).current;
}

export async function getSkyNow(): Promise<SkyNow | null> {
  const override = await getSkyOverride();
  if (override) {
    const current = await fetchCurrent("temperature_2m,is_day").catch(() => null);
    return {
      effect: override.effect,
      intensity: override.intensity,
      level: LEVEL[override.intensity],
      label: OVERRIDE_LABELS[override.effect],
      temperatureC: current ? Math.round(current.temperature_2m) : null,
      isDay: current ? current.is_day === 1 : override.effect !== "night",
      observedAt: new Date().toISOString(),
    };
  }

  try {
    const current = await fetchCurrent("temperature_2m,weather_code,is_day,precipitation,snowfall,cloud_cover");
    if (!current) return null;
    const code = Number(current.weather_code);
    const isDay = current.is_day === 1;
    const { effect, intensity } = skyFromCode(code, isDay, Number(current.cloud_cover) || 0);
    const measured = levelFromAmount(effect, Number(current.precipitation) || 0, Number(current.snowfall) || 0);
    // Cloud cover can turn a "clear" code into clouds — keep the label honest.
    const label =
      effect === "clouds" && code <= 2 ? (intensity === "heavy" ? "Overcast" : "Partly cloudy") : (WEATHER_LABELS[code] ?? "—");

    return {
      effect,
      intensity,
      level: measured ?? LEVEL[intensity],
      label,
      temperatureC: Math.round(current.temperature_2m),
      isDay,
      observedAt: String(current.time),
    };
  } catch {
    return null;
  }
}
