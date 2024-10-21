import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn'], // Add 'debug' if you want to see the debug logs
  });
  await app.listen(3000);
}
bootstrap();
