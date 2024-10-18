import { NestFactory } from '@nestjs/core';
import { AppModule } from './gateway-api.module';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Set up microservice communication with Redis
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.REDIS,
    options: { port: 6379, host: 'localhost' },
  });

  // Start microservices
  await app.startAllMicroservices();

  // Enable CORS if necessary
  app.enableCors();

  // Start the HTTP server
  await app.listen(3000);
  console.log('Gateway API is running on http://localhost:3000');
}
bootstrap();
