import "dotenv/config";
import { defineConfig, env } from "prisma/config";

// Prisma 7: connection info for the CLI (migrate/studio/seed) lives here,
// not in schema.prisma. Application code gets its own connection via the
// driver adapter in src/server/db/prisma.ts.
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx --env-file=.env prisma/seed.ts",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
