import { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireRole } from "@/server/auth/guards";
import { prisma } from "@/server/db/prisma";
import { withErrorHandling, apiSuccess } from "@/server/lib/api-response";
import { getSkyNow, getSkyOverride, SKY_OVERRIDE_EFFECTS, SKY_OVERRIDE_KEY, type SkyOverride } from "@/server/lib/weather";

// Staff on the ground set what the sky over Bir is really doing when the
// forecast model gets it wrong. Paragliding and content managers can both
// do it — whoever is at the site that day.
const ROLES = ["SUPER_ADMIN", "PARAGLIDING_MANAGER", "CONTENT_MANAGER"] as const;

const overrideSchema = z.union([
  z.object({ effect: z.literal("auto") }),
  z.object({
    effect: z.enum(SKY_OVERRIDE_EFFECTS),
    intensity: z.enum(["light", "moderate", "heavy"]).default("moderate"),
    hours: z.number().int().min(1).max(12).default(3),
  }),
]);

export const GET = withErrorHandling(async () => {
  await requireRole(...ROLES);
  const [override, sky] = await Promise.all([getSkyOverride(), getSkyNow()]);
  return apiSuccess({ override, sky });
});

export const PUT = withErrorHandling(async (request: NextRequest) => {
  const user = await requireRole(...ROLES);
  const input = overrideSchema.parse(await request.json());

  if (input.effect === "auto") {
    await prisma.siteSetting.deleteMany({ where: { key: SKY_OVERRIDE_KEY } });
  } else {
    const value: SkyOverride = {
      effect: input.effect,
      intensity: input.intensity,
      until: new Date(Date.now() + input.hours * 3600_000).toISOString(),
      setBy: user.name,
    };
    await prisma.siteSetting.upsert({
      where: { key: SKY_OVERRIDE_KEY },
      create: { key: SKY_OVERRIDE_KEY, value },
      update: { value },
    });
  }

  // Visitors see the change on their next poll instead of after the cache.
  revalidatePath("/api/weather");
  const [override, sky] = await Promise.all([getSkyOverride(), getSkyNow()]);
  return apiSuccess({ override, sky });
});
