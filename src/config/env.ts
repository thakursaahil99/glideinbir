import { z } from "zod";

// Validated once at startup. Import `env` anywhere on the server instead of
// touching `process.env` directly, so a missing/invalid variable fails fast
// with a clear message rather than surfacing as a runtime bug later.
const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  NEXT_PUBLIC_SITE_URL: z.string().url(),

  SESSION_SECRET: z.string().min(32, "SESSION_SECRET must be at least 32 characters"),

  NEXT_PUBLIC_RAZORPAY_KEY_ID: z.string().min(1),
  RAZORPAY_KEY_ID: z.string().min(1),
  RAZORPAY_KEY_SECRET: z.string().min(1),
  RAZORPAY_WEBHOOK_SECRET: z.string().min(1),
  // Local/demo only: skips the real Razorpay order-create + checkout widget
  // and lets a booking be "paid" with one click, so the booking flow can be
  // tested end-to-end without a real Razorpay account. Must stay false
  // anywhere real money could be involved.
  PAYMENT_DEMO_MODE: z.coerce.boolean().default(false),

  STORAGE_DRIVER: z.enum(["local", "cloudinary", "s3"]).default("local"),

  EMAIL_PROVIDER: z.enum(["resend", "ses"]).default("resend"),
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().min(1),

  // Only read by prisma/seed.ts to create the initial Super Admin (section 13).
  SUPER_ADMIN_NAME: z.string().optional(),
  SUPER_ADMIN_EMAIL: z.string().email().optional(),
  SUPER_ADMIN_PASSWORD: z.string().min(8).optional(),
});

function loadEnv() {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");
    throw new Error(`Invalid environment variables:\n${issues}`);
  }
  return parsed.data;
}

export const env = loadEnv();
