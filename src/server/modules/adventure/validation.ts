import { z } from "zod";

const pricingUnitSchema = z.enum(["PER_PERSON", "PER_NIGHT", "PER_GROUP", "FIXED"]);

export const categoryInputSchema = z.object({
  name: z.string().trim().min(1).max(120),
  slug: z.string().trim().min(1).max(140).optional(),
  description: z.string().trim().max(2000).optional(),
  isActive: z.boolean().default(true),
  order: z.number().int().default(0),
});
export const categoryUpdateSchema = categoryInputSchema.partial();

export const itemInputSchema = z.object({
  categoryId: z.string().min(1),
  title: z.string().trim().min(1).max(160),
  slug: z.string().trim().min(1).max(180).optional(),
  shortDescription: z.string().trim().max(300).optional(),
  description: z.string().trim().min(1),
  pricingUnit: pricingUnitSchema,
  price: z.number().positive(),
  durationLabel: z.string().trim().min(1).max(80),
  includes: z.array(z.string().trim().min(1)).default([]),
  excludes: z.array(z.string().trim().min(1)).default([]),
  requirements: z.array(z.string().trim().min(1)).default([]),
  minCapacity: z.number().int().positive().optional(),
  maxCapacity: z.number().int().positive().optional(),
  location: z.string().trim().min(1).max(160),
  isActive: z.boolean().default(true),
});
export const itemUpdateSchema = itemInputSchema.partial();

export const listItemsQuerySchema = z.object({
  categorySlug: z.string().trim().min(1).optional(),
  pricingUnit: pricingUnitSchema.optional(),
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
  capacity: z.number().int().positive(),
});
export const slotUpdateSchema = z.object({
  capacity: z.number().int().positive().optional(),
  status: z.enum(["ACTIVE", "CANCELLED"]).optional(),
});

export const slotsQuerySchema = z.object({
  date: z.coerce.date().optional(),
});
