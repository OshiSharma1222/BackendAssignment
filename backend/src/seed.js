const bcrypt = require('bcryptjs');
const env = require('./config/env');
const prisma = require('./config/prisma');

async function main() {
  if (!env.SEED_ADMIN_EMAIL || !env.SEED_ADMIN_PASSWORD) {
    // eslint-disable-next-line no-console
    console.log('[seed] SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD not set. Skipping.');
    return;
  }

  const existing = await prisma.user.findUnique({ where: { email: env.SEED_ADMIN_EMAIL } });
  if (existing) {
    const updated = await prisma.user.update({
      where: { email: env.SEED_ADMIN_EMAIL },
      data: { role: 'ADMIN' },
    });
    // eslint-disable-next-line no-console
    console.log(`[seed] Promoted existing user to ADMIN: ${updated.email}`);
    return;
  }

  const passwordHash = await bcrypt.hash(env.SEED_ADMIN_PASSWORD, 12);
  const admin = await prisma.user.create({
    data: {
      name: env.SEED_ADMIN_NAME,
      email: env.SEED_ADMIN_EMAIL,
      passwordHash,
      role: 'ADMIN',
    },
  });
  // eslint-disable-next-line no-console
  console.log(`[seed] Created admin user: ${admin.email}`);
}

main()
  .catch((e) => {
    // eslint-disable-next-line no-console
    console.error('[seed] Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
