import { Controller, Get } from '@nestjs/common';
import { TrackingServiceService } from '../services/tracking-service.service';

@Controller()
export class TrackingServiceController {
  constructor(
    private readonly trackingServiceService: TrackingServiceService,
  ) {}

  @Get()
  getHello(): string {
    return this.trackingServiceService.getHello();
  }
}
