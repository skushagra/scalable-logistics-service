import { IsNumber, IsLatitude, IsLongitude } from 'class-validator';

export class UpdateLocationDto {
  @IsNumber()
  driverId: number;

  @IsLatitude()
  latitude: number;

  @IsLongitude()
  longitude: number;
}
