import { z } from "zod";

const modeSchema = z.enum(["BUS", "TAXI"]);
const pricingUnitSchema = z.enum(["PER_SEAT", "PER_TRIP"]);

export const routeInputSchema = z.object({
  mode: modeSchema,
  title: z.string().trim().min(1).max(160),
  slug: z.string().trim().min(1).max(180).optional(),
  fromLocation: z.string().trim().min(1).max(120),
  toLocation: z.string().trim().min(1).max(120),
  vehicleType: z.string().trim().min(1).max(120),
  description: z.string().trim().min(1),
  pricingUnit: pricingUnitSchema,
  price: z.number().positive(),
  durationLabel: z.string().trim().min(1).max(80),
  capacity: z.number().int().positive(),
  includes: z.array(z.string().trim().min(1)).default([]),
  excludes: z.array(z.string().trim().min(1)).default([]),
  isActive: z.boolean().default(true),
});
export const routeUpdateSchema = routeInputSchema.partial();

export const listRoutesQuerySchema = z.object({
  mode: modeSchema.optional(),
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().nonnegative().optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(50).default(20),
});

export const mediaInputSchema = z.object({
  url: z.string().trim().url(),
  type: z.enum(["IMAGE", "VIDEO"]).default("IMAGE"),
  order: z.number().int().default(0),
});

export const slotInputSchema = z.object({
  date: z.coerce.date(),
  departureTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "departureTime must be in HH:mm 24-hour format"),
  capacity: z.number().int().positive(),
});
export const slotUpdateSchema = z.object({
  capacity: z.number().int().positive().optional(),
  status: z.enum(["ACTIVE", "CANCELLED"]).optional(),
});

export const slotsQuerySchema = z.object({
  date: z.coerce.date().optional(),
});
