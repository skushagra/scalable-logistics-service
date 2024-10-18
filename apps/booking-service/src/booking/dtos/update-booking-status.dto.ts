import { IsNumber, IsString } from 'class-validator';

export class UpdateBookingStatusDto {
  @IsNumber()
  bookingId: number;

  @IsString()
  status: string;
}
