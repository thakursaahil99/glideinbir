import { z } from "zod";

export const pageContentUpdateSchema = z.object({
  title: z.string().trim().min(1).max(200),
  body: z.string().trim().min(1),
});
