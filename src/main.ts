import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));

  await app.listen(process.env.PORT ?? 3002);
  logger.log('Product Service is running on port', process.env.PORT ?? 3002);

  app.enableShutdownHooks();

  process.on('SIGTERM', async () => {
    logger.warn('SIGTERM received: shutting down gracefully...');
    await app.close();
    logger.log('✅ Product Service closed gracefully');
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    logger.warn('SIGINT received: shutting down gracefully...');
    await app.close();
    logger.log('✅ Product Service closed gracefully');
    process.exit(0);
  });
}
bootstrap();
