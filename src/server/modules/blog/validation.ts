import { z } from "zod";

export const blogPostInputSchema = z.object({
  title: z.string().trim().min(1).max(200),
  slug: z.string().trim().min(1).max(200).optional(),
  excerpt: z.string().trim().min(1).max(400),
  body: z.string().trim().min(1),
  coverImage: z.string().trim().url().optional(),
  isActive: z.boolean().default(true),
});

export const blogPostUpdateSchema = blogPostInputSchema.partial();
