import { getFlyingConditions } from "@/server/lib/weather";
import { Wind, Thermometer, Cloud } from "lucide-react";
import { clsx } from "clsx";

const DOT_COLOR = {
  good: "bg-emerald-500",
  moderate: "bg-amber-500",
  poor: "bg-red-500",
};

export async function FlyingConditions() {
  const conditions = await getFlyingConditions();
  if (!conditions) return null;

  return (
    <div className="glass flex flex-wrap items-center gap-x-5 gap-y-2 rounded-2xl px-5 py-3 text-sm text-white">
      <span className="flex items-center gap-1.5">
        <span className={clsx("h-2 w-2 rounded-full", DOT_COLOR[conditions.flyability])} />
        {conditions.flyabilityLabel}
      </span>
      <span className="flex items-center gap-1.5 text-white/80">
        <Wind className="h-4 w-4" /> {conditions.windKmh} km/h
      </span>
      <span className="flex items-center gap-1.5 text-white/80">
        <Thermometer className="h-4 w-4" /> {conditions.temperatureC}°C
      </span>
      <span className="flex items-center gap-1.5 text-white/80">
        <Cloud className="h-4 w-4" /> {conditions.conditionLabel}
      </span>
      <span className="text-xs text-white/50">Live at Billing · final call is your pilot&apos;s</span>
    </div>
  );
}
