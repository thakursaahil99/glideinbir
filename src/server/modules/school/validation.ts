import { z } from "zod";

const timeSchema = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "must be in HH:mm 24-hour format");

const syllabusItemSchema = z.object({
  title: z.string().trim().min(1),
  description: z.string().trim().min(1),
});

const dailyScheduleItemSchema = z.object({
  day: z.string().trim().min(1),
  startTime: timeSchema,
  endTime: timeSchema,
});

export const courseInputSchema = z.object({
  title: z.string().trim().min(1).max(160),
  slug: z.string().trim().min(1).max(180).optional(),
  description: z.string().trim().min(1),
  level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED", "CERTIFICATION"]),
  durationDays: z.number().int().positive(),
  fee: z.number().positive(),
  location: z.string().trim().min(1).max(160),
  requirements: z.array(z.string().trim().min(1)).default([]),
  minAge: z.number().int().positive().optional(),
  syllabus: z.array(syllabusItemSchema).default([]),
  includes: z.array(z.string().trim().min(1)).default([]),
  excludes: z.array(z.string().trim().min(1)).default([]),
  isActive: z.boolean().default(true),
});
export const courseUpdateSchema = courseInputSchema.partial();

export const listCoursesQuerySchema = z.object({
  level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED", "CERTIFICATION"]).optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(50).default(20),
});

export const courseMediaInputSchema = z.object({
  url: z.string().trim().url(),
  type: z.enum(["IMAGE", "VIDEO"]).default("IMAGE"),
  order: z.number().int().default(0),
});

export const instructorInputSchema = z.object({
  name: z.string().trim().min(1).max(160),
  slug: z.string().trim().min(1).max(180).optional(),
  photoUrl: z.string().trim().url().optional(),
  bio: z.string().trim().max(2000).optional(),
  experienceYears: z.number().int().nonnegative().optional(),
  certifications: z.array(z.string().trim().min(1)).default([]),
  contactEmail: z.string().trim().email().optional(),
  contactPhone: z.string().trim().min(6).max(20).optional(),
  isActive: z.boolean().default(true),
});
export const instructorUpdateSchema = instructorInputSchema.partial();

export const batchInputSchema = z
  .object({
    instructorId: z.string().min(1),
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    dailySchedule: z.array(dailyScheduleItemSchema).default([]),
    location: z.string().trim().min(1).max(160),
    maxStudents: z.number().int().positive(),
  })
  .refine((data) => data.endDate >= data.startDate, {
    message: "endDate must be on or after startDate",
    path: ["endDate"],
  });

export const batchUpdateSchema = z.object({
  instructorId: z.string().min(1).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  dailySchedule: z.array(dailyScheduleItemSchema).optional(),
  location: z.string().trim().min(1).max(160).optional(),
  maxStudents: z.number().int().positive().optional(),
  status: z.enum(["UPCOMING", "ONGOING", "COMPLETED", "CANCELLED"]).optional(),
});
