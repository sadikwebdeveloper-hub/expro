import app from './server/app.js';
import env from './server/config/env.js';
import mailService from './server/services/mailService.js';
import cloudinaryService from './server/services/cloudinaryService.js';
import settingsService from './server/services/settingsService.js';
import logger from './server/services/logger.js';

const PORT = env.port;

async function bootstrap() {
  logger.startup(`Starting Expro Group server (${env.nodeEnv})`);

  await settingsService.ensureSettings();

  const smtpStatus = await mailService.verifyOnStartup();
  const cloudinaryStatus = await cloudinaryService.verifyOnStartup();

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n========================================`);
    console.log(`  Expro Group Server — Port ${PORT}`);
    console.log(`  Environment: ${env.nodeEnv}`);
    console.log(`  ${smtpStatus.message}`);
    console.log(`  ${cloudinaryStatus.message}`);
    console.log(`========================================\n`);
    logger.startup('Server listening', { port: PORT, smtp: smtpStatus.verified, cloudinary: cloudinaryStatus.verified });
  });
}

bootstrap().catch((err) => {
  logger.error('Server bootstrap failed', { error: err.message });
  console.error('Fatal startup error:', err);
  process.exit(1);
});
