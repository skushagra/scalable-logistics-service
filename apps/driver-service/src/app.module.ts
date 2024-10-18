import { Module } from '@nestjs/common';
import { DriverModule } from './driver/driver-service.module';

@Module({
  imports: [DriverModule],
})
export class AppModule {}
