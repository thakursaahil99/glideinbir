import { z } from "zod";

const flightTypeSchema = z.enum(["TANDEM", "SOLO", "CROSS_COUNTRY"]);

export const categoryInputSchema = z.object({
  name: z.string().trim().min(1).max(120),
  slug: z.string().trim().min(1).max(140).optional(),
  description: z.string().trim().max(2000).optional(),
  isActive: z.boolean().default(true),
  order: z.number().int().default(0),
});
export const categoryUpdateSchema = categoryInputSchema.partial();

export const packageInputSchema = z.object({
  categoryId: z.string().min(1),
  title: z.string().trim().min(1).max(160),
  slug: z.string().trim().min(1).max(180).optional(),
  shortDescription: z.string().trim().max(300).optional(),
  description: z.string().trim().min(1),
  flightType: flightTypeSchema,
  price: z.number().positive(),
  durationMinutes: z.number().int().positive(),
  includes: z.array(z.string().trim().min(1)).default([]),
  excludes: z.array(z.string().trim().min(1)).default([]),
  requirements: z.array(z.string().trim().min(1)).default([]),
  minAge: z.number().int().positive().optional(),
  maxAge: z.number().int().positive().optional(),
  minWeightKg: z.number().int().positive().optional(),
  maxWeightKg: z.number().int().positive().optional(),
  safetyInfo: z.string().trim().max(2000).optional(),
  location: z.string().trim().min(1).max(160),
  pickupAvailable: z.boolean().default(false),
  pickupInfo: z.string().trim().max(500).optional(),
  isActive: z.boolean().default(true),
});
export const packageUpdateSchema = packageInputSchema.partial();

export const listPackagesQuerySchema = z.object({
  categorySlug: z.string().trim().min(1).optional(),
  flightType: flightTypeSchema.optional(),
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
  startTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "startTime must be in HH:mm 24-hour format"),
  capacity: z.number().int().positive(),
});
export const slotUpdateSchema = z.object({
  capacity: z.number().int().positive().optional(),
  status: z.enum(["ACTIVE", "CANCELLED"]).optional(),
});

export const slotsQuerySchema = z.object({
  date: z.coerce.date().optional(),
});
