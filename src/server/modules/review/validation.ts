import { z } from "zod";

export const reviewInputSchema = z.object({
  bookingId: z.string().min(1),
  targetType: z.enum(["PARAGLIDING", "SCHOOL", "HOTEL"]),
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().max(2000).optional(),
});

export const reviewModerateSchema = z.object({
  status: z.enum(["APPROVED", "HIDDEN"]),
});
