"use client";

import { useEffect, useState, useTransition } from "react";
import { clsx } from "clsx";
import { Cloud, CloudFog, CloudLightning, CloudRain, Moon, Snowflake, Sun, RotateCcw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";

type Effect = "sun" | "night" | "clouds" | "rain" | "snow" | "storm" | "fog";
type Intensity = "light" | "moderate" | "heavy";
type State = {
  override: { effect: Effect; intensity: Intensity; until: string; setBy: string } | null;
  sky: { effect: string; label: string; temperatureC: number | null } | null;
};

const OPTIONS: { effect: Effect; label: string; icon: typeof Sun }[] = [
  { effect: "sun", label: "Sunny", icon: Sun },
  { effect: "clouds", label: "Cloudy", icon: Cloud },
  { effect: "rain", label: "Rain", icon: CloudRain },
  { effect: "storm", label: "Storm", icon: CloudLightning },
  { effect: "fog", label: "Fog", icon: CloudFog },
  { effect: "snow", label: "Snow", icon: Snowflake },
  { effect: "night", label: "Night", icon: Moon },
];

// The forecast model misses the local clouds that build over Bir, so
// whoever is at the site can set the sky on the website by hand. It goes
// back to live data by itself after the chosen hours.
export function WeatherControl() {
  const [state, setState] = useState<State | null>(null);
  const [intensity, setIntensity] = useState<Intensity>("moderate");
  const [hours, setHours] = useState(3);
  const [isPending, startTransition] = useTransition();
  const toast = useToast();

  useEffect(() => {
    fetch("/api/admin/weather")
      .then((res) => res.json())
      .then((body) => body.success && setState(body.data));
  }, []);

  function save(payload: object) {
    startTransition(async () => {
      const res = await fetch("/api/admin/weather", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = await res.json();
      if (!res.ok || !body.success) {
        toast.error(body.error?.message ?? "Could not update the weather.");
        return;
      }
      setState(body.data);
      toast.success("Site weather updated.");
    });
  }

  const override = state?.override;
  const sky = state?.sky;

  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold">Site weather</h2>
          <p className="mt-0.5 text-sm text-muted">
            {sky ? (
              <>
                Showing now: <span className="font-medium text-ink">{sky.label}</span>
                {sky.temperatureC !== null && ` · ${sky.temperatureC}°C`}
                {override
                  ? ` — set by ${override.setBy} until ${new Date(override.until).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })}`
                  : " — live forecast"}
              </>
            ) : (
              "Loading…"
            )}
          </p>
          <p className="mt-1 text-xs text-muted">
            Forecast wrong? Pick what the sky over Bir really looks like. It switches back to live data on its own.
          </p>
        </div>
        {override && (
          <button
            type="button"
            disabled={isPending}
            onClick={() => save({ effect: "auto" })}
            className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-brand transition-colors hover:bg-brand/10"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Back to live
          </button>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {OPTIONS.map((o) => (
          <button
            key={o.effect}
            type="button"
            disabled={isPending}
            onClick={() => save({ effect: o.effect, intensity, hours })}
            className={clsx(
              "flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-colors disabled:opacity-50",
              override?.effect === o.effect
                ? "border-brand bg-brand/10 text-brand"
                : "border-border hover:border-brand/50 hover:bg-black/[0.03]",
            )}
          >
            <o.icon className="h-4 w-4" /> {o.label}
          </button>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted">
        <label className="flex items-center gap-2">
          Strength
          <select
            value={intensity}
            onChange={(e) => setIntensity(e.target.value as Intensity)}
            className="rounded-md border border-border px-2 py-1 text-xs"
          >
            <option value="light">Light</option>
            <option value="moderate">Moderate</option>
            <option value="heavy">Heavy</option>
          </select>
        </label>
        <label className="flex items-center gap-2">
          For
          <select
            value={hours}
            onChange={(e) => setHours(Number(e.target.value))}
            className="rounded-md border border-border px-2 py-1 text-xs"
          >
            {[1, 2, 3, 4, 6, 8, 12].map((h) => (
              <option key={h} value={h}>
                {h} hour{h > 1 && "s"}
              </option>
            ))}
          </select>
        </label>
      </div>
    </Card>
  );
}
