import { z } from "zod";

const paraglidingItemSchema = z.object({
  itemType: z.literal("PARAGLIDING"),
  packageId: z.string().min(1),
  slotId: z.string().min(1),
  passengers: z.number().int().positive(),
});

const schoolItemSchema = z.object({
  itemType: z.literal("SCHOOL"),
  courseId: z.string().min(1),
  batchId: z.string().min(1),
  students: z.number().int().positive(),
});

const hotelItemSchema = z
  .object({
    itemType: z.literal("HOTEL"),
    hotelId: z.string().min(1),
    roomId: z.string().min(1),
    checkIn: z.coerce.date(),
    checkOut: z.coerce.date(),
    rooms: z.number().int().positive(),
    guests: z.number().int().positive(),
  })
  .refine((data) => data.checkOut > data.checkIn, {
    message: "checkOut must be after checkIn",
    path: ["checkOut"],
  });

export const bookingItemSchema = z.discriminatedUnion("itemType", [
  paraglidingItemSchema,
  schoolItemSchema,
  hotelItemSchema,
]);

export const createBookingSchema = z.object({
  items: z.array(bookingItemSchema).min(1),
  customerName: z.string().trim().min(1).max(160),
  customerEmail: z.string().trim().toLowerCase().email(),
  customerPhone: z.string().trim().min(6).max(20),
  couponCode: z.string().trim().min(1).optional(),
  notes: z.string().trim().max(1000).optional(),
});

export type BookingItemInput = z.infer<typeof bookingItemSchema>;
export type CreateBookingInput = z.infer<typeof createBookingSchema>;
