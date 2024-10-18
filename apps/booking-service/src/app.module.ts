import { Module } from '@nestjs/common';
import { BookingModule } from './booking/booking-service.module';


@Module({
  imports: [BookingModule],
})
export class AppModule {}
