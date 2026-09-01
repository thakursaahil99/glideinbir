import { z } from "zod";

export const faqInputSchema = z.object({
  question: z.string().trim().min(1).max(300),
  answer: z.string().trim().min(1).max(4000),
  category: z.enum(["GENERAL", "PARAGLIDING", "SCHOOL", "HOTEL"]).default("GENERAL"),
  order: z.number().int().default(0),
  isActive: z.boolean().default(true),
  paraglidingPackageId: z.string().trim().min(1).optional(),
  schoolCourseId: z.string().trim().min(1).optional(),
  hotelId: z.string().trim().min(1).optional(),
});

export const faqUpdateSchema = faqInputSchema.partial();
