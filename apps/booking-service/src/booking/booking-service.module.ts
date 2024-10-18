import { Module } from '@nestjs/common';
import { BookingService } from './booking-service.service';
import { BookingController } from './booking-service.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booking } from './entities/booking.entity';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost', // Adjust if necessary
      port: 5432, // Adjust if necessary
      username: 'postgres',
      password: 'password',
      database: 'logistics',
      entities: [Booking],
      synchronize: true, // Set to false in production
    }),
    TypeOrmModule.forFeature([Booking]),
  ],
  controllers: [BookingController],
  providers: [BookingService],
})
export class BookingModule {}
