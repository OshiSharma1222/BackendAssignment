const env = require('./config/env');
const prisma = require('./config/prisma');
const app = require('./app');

async function start() {
  try {
    await prisma.$connect();
    // eslint-disable-next-line no-console
    console.log('[db] Connected to PostgreSQL via Prisma');
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[db] Failed to connect:', err.message);
    process.exit(1);
  }

  const server = app.listen(env.PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`[server] listening on http://localhost:${env.PORT} (${env.NODE_ENV})`);
    // eslint-disable-next-line no-console
    console.log(`[server] API base:  http://localhost:${env.PORT}/api/v1`);
    // eslint-disable-next-line no-console
    console.log(`[server] Swagger:   http://localhost:${env.PORT}/docs`);
  });

  const shutdown = async (signal) => {
    // eslint-disable-next-line no-console
    console.log(`\n[server] ${signal} received, shutting down...`);
    server.close(async () => {
      await prisma.$disconnect();
      process.exit(0);
    });
  };
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

start();
