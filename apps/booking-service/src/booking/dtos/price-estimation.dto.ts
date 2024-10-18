import { IsString } from 'class-validator';

export class PriceEstimationDto {
  @IsString()
  pickupLocation: string;

  @IsString()
  dropOffLocation: string;

  @IsString()
  vehicleType: string;
}
