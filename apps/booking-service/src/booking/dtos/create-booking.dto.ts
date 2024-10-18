import { IsString, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateBookingDto {
  @IsNumber()
  userId: number;

  @IsString()
  @IsNotEmpty()
  vehicleType: string;

  @IsString()
  @IsNotEmpty()
  pickupLocation: string;

  @IsString()
  @IsNotEmpty()
  dropOffLocation: string;
}
