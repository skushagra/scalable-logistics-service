import { IsEmail, IsString, MinLength } from 'class-validator';

export class CreateDriverDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  licenseNumber: string;

  @IsString()
  vehicleType: string;
}
