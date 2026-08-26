import { z } from "zod";

const timeSchema = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "must be in HH:mm 24-hour format");

export const hotelInputSchema = z.object({
  name: z.string().trim().min(1).max(160),
  slug: z.string().trim().min(1).max(180).optional(),
  description: z.string().trim().min(1),
  address: z.string().trim().min(1).max(300),
  city: z.string().trim().min(1).max(120),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  checkInTime: timeSchema,
  checkOutTime: timeSchema,
  policies: z.string().trim().max(4000).optional(),
  isActive: z.boolean().default(true),
  amenityIds: z.array(z.string().min(1)).default([]),
});
export const hotelUpdateSchema = hotelInputSchema.partial();

export const listHotelsQuerySchema = z.object({
  city: z.string().trim().min(1).optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(50).default(20),
});

export const hotelMediaInputSchema = z.object({
  url: z.string().trim().url(),
  type: z.enum(["IMAGE", "VIDEO"]).default("IMAGE"),
  order: z.number().int().default(0),
});

export const amenityInputSchema = z.object({
  name: z.string().trim().min(1).max(120),
  icon: z.string().trim().max(60).optional(),
});
export const amenityUpdateSchema = amenityInputSchema.partial();

export const roomInputSchema = z.object({
  name: z.string().trim().min(1).max(160),
  type: z.string().trim().min(1).max(80),
  description: z.string().trim().min(1),
  occupancyAdults: z.number().int().positive(),
  occupancyChildren: z.number().int().nonnegative().default(0),
  pricePerNight: z.number().positive(),
  totalRooms: z.number().int().positive(),
  isActive: z.boolean().default(true),
  amenityIds: z.array(z.string().min(1)).default([]),
});
export const roomUpdateSchema = roomInputSchema.partial();

export const roomMediaInputSchema = z.object({
  url: z.string().trim().url(),
  order: z.number().int().default(0),
});

export const availabilityQuerySchema = z
  .object({
    checkIn: z.coerce.date(),
    checkOut: z.coerce.date(),
    rooms: z.coerce.number().int().positive().default(1),
  })
  .refine((data) => data.checkOut > data.checkIn, {
    message: "checkOut must be after checkIn",
    path: ["checkOut"],
  });

export const availabilityOverrideSchema = z.object({
  date: z.coerce.date(),
  isBlocked: z.boolean().optional(),
  totalRooms: z.number().int().nonnegative().optional(),
});
