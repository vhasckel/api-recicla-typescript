import { app } from './app';
import { db } from './infra/database';
import { settings } from './settings';

async function bootstrap() {
  try {
    await db.connect();

    const server = app.listen(settings.server.port, () => {
      console.log(
        `✓ App ${settings.server.name} listening on port ${settings.server.port}`
      );
    });

    const shutdown = async () => {
      console.log('\n⏳ Shutting down gracefully...');

      server.close(async () => {
        await db.close();
        console.log('✓ Server closed');
        process.exit(0);
      });

      setTimeout(() => {
        console.error('✗ Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (error) {
    console.error('✗ Failed to start application:', error);
    process.exit(1);
  }
}

bootstrap();
