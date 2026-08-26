import { z } from "zod";

const roleSchema = z.enum([
  "SUPER_ADMIN",
  "BOOKING_MANAGER",
  "PARAGLIDING_MANAGER",
  "SCHOOL_MANAGER",
  "HOTEL_MANAGER",
  "FINANCE_MANAGER",
  "CONTENT_MANAGER",
  "CUSTOMER",
]);

export const createStaffSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8).max(72),
  role: roleSchema,
});

export const updateUserSchema = z.object({
  role: roleSchema.optional(),
  isActive: z.boolean().optional(),
});
