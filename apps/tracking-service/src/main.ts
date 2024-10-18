import { NestFactory } from '@nestjs/core';
import { TrackingServiceModule } from './tracking-service.module';

async function bootstrap() {
  const app = await NestFactory.create(TrackingServiceModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
