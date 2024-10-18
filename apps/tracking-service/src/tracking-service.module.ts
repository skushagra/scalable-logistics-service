import { Module } from '@nestjs/common';
import { TrackingServiceController } from './controllers/tracking-service.controller';
import { TrackingServiceService } from './services/tracking-service.service';

@Module({
  imports: [],
  controllers: [TrackingServiceController],
  providers: [TrackingServiceService],
})
export class TrackingServiceModule {}
