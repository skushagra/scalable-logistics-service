import { Module } from '@nestjs/common';
import { UserController } from './controllers/user.controller';
import { DriverController } from './controllers/driver.controller';
import { BookingController } from './controllers/booking.controller';
import { TrackingGateway } from './gateways/tracking.gateway';

@Module({
  imports: [],
  controllers: [
    UserController,
    DriverController,
    BookingController,
    TrackingGateway,
  ],
  providers: [],
})
export class AppModule {}
