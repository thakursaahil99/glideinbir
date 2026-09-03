import { z } from "zod";

// z.coerce.boolean() just runs Boolean(value) under the hood — for a string
// env var that means Boolean("false") === true, since any non-empty string
// is truthy. This actually parses "false"/"0"/"no" (case-insensitive) as
// false, only treating an already-boolean input as a pass-through.
const booleanString = z
  .union([z.boolean(), z.string()])
  .transform((val) => (typeof val === "boolean" ? val : !["false", "0", "no", ""].includes(val.toLowerCase())));

// Validated once at startup. Import `env` anywhere on the server instead of
// touching `process.env` directly, so a missing/invalid variable fails fast
// with a clear message rather than surfacing as a runtime bug later.
const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  NEXT_PUBLIC_SITE_URL: z.string().url().default("https://glideinbir.vercel.app"),

  SESSION_SECRET: z
    .string()
    .min(32, "SESSION_SECRET must be at least 32 characters")
    .default("dev-only-placeholder-please-replace-64-char-hex-0123456789abcd"),

  NEXT_PUBLIC_RAZORPAY_KEY_ID: z.string().min(1).default("rzp_test_placeholder"),
  RAZORPAY_KEY_ID: z.string().min(1).default("rzp_test_placeholder"),
  RAZORPAY_KEY_SECRET: z.string().min(1).default("dev-placeholder-secret"),
  RAZORPAY_WEBHOOK_SECRET: z.string().min(1).default("dev-placeholder-webhook-secret"),
  // Local/demo only: skips the real Razorpay order-create + checkout widget
  // and lets a booking be "paid" with one click, so the booking flow can be
  // tested end-to-end without a real Razorpay account. Must stay false
  // anywhere real money could be involved.
  PAYMENT_DEMO_MODE: booleanString.default(true),

  STORAGE_DRIVER: z.enum(["local", "cloudinary", "s3"]).default("local"),

  EMAIL_PROVIDER: z.enum(["resend", "ses"]).default("resend"),
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().min(1).default("Glideinbir <bookings@glideinbir.com>"),

  // Only read by prisma/seed.ts to create the initial Super Admin (section 13).
  SUPER_ADMIN_NAME: z.string().optional(),
  SUPER_ADMIN_EMAIL: z.string().email().optional(),
  SUPER_ADMIN_PASSWORD: z.string().min(8).optional(),

  // Checked against the `Authorization: Bearer` header Vercel Cron sends
  // automatically when this env var is set on the project — see
  // /api/cron/booking-reminders. Unset locally is fine (that route just
  // 401s), no impact on the rest of the app.
  CRON_SECRET: z.string().optional(),

  // --- Sahu Bhai (admin AI assistant) ---
  // Any OpenAI-compatible chat-completions provider works (Groq, Google
  // Gemini, OpenRouter, Cerebras…). The feature stays completely dormant
  // until SAHU_BHAI_API_KEY is set — see SAHU_BHAI.md for provider options.
  SAHU_BHAI_API_KEY: z.string().optional(),
  SAHU_BHAI_BASE_URL: z.string().url().default("https://api.groq.com/openai/v1"),
  SAHU_BHAI_MODEL: z.string().min(1).default("qwen/qwen3.8-27b"),
});

function loadEnv() {
  // Vercel (and other dashboards) can persist a variable with an empty
  // string value instead of leaving it unset. Zod's `.default()` and
  // `.optional()` only trigger on `undefined`, so an empty string would
  // otherwise fail validation (e.g. EMAIL_FROM min-length, SUPER_ADMIN_EMAIL
  // email format) instead of falling back. Treat "" as unset.
  const source = Object.fromEntries(
    Object.entries(process.env).filter(([, value]) => value !== "")
  );
  const parsed = envSchema.safeParse(source);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");
    throw new Error(`Invalid environment variables:\n${issues}`);
  }
  return parsed.data;
}

export const env = loadEnv();
