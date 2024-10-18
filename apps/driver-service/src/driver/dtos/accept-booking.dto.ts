import { IsNumber } from 'class-validator';

export class AcceptBookingDto {
  @IsNumber()
  bookingId: number;
}
