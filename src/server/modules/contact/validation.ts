import { z } from "zod";

export const contactMessageInputSchema = z.object({
  name: z.string().trim().min(1).max(200),
  email: z.string().trim().toLowerCase().email(),
  phone: z.string().trim().max(30).optional(),
  message: z.string().trim().min(1).max(4000),
});
