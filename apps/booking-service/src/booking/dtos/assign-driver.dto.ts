import { IsNumber } from 'class-validator';

export class AssignDriverDto {
  @IsNumber()
  bookingId: number;

  @IsNumber()
  driverId: number;
}
