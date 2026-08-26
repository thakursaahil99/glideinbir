import { prisma } from "../src/server/db/prisma";
import { hashPassword } from "../src/server/auth/password";
import { env } from "../src/config/env";

async function main() {
  const { SUPER_ADMIN_NAME, SUPER_ADMIN_EMAIL, SUPER_ADMIN_PASSWORD } = env;
  if (!SUPER_ADMIN_NAME || !SUPER_ADMIN_EMAIL || !SUPER_ADMIN_PASSWORD) {
    throw new Error(
      "SUPER_ADMIN_NAME, SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD must be set in .env to seed the initial Super Admin.",
    );
  }

  const existing = await prisma.user.findUnique({ where: { email: SUPER_ADMIN_EMAIL } });
  if (existing) {
    console.log(`Super Admin already exists (${SUPER_ADMIN_EMAIL}), skipping.`);
    return;
  }

  const passwordHash = await hashPassword(SUPER_ADMIN_PASSWORD);
  await prisma.user.create({
    data: {
      name: SUPER_ADMIN_NAME,
      email: SUPER_ADMIN_EMAIL,
      passwordHash,
      role: "SUPER_ADMIN",
      emailVerifiedAt: new Date(),
    },
  });
  console.log(`Super Admin created (${SUPER_ADMIN_EMAIL}).`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
