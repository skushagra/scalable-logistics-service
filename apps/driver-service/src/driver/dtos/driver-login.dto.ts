import { IsEmail, IsString } from 'class-validator';

export class DriverLoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}
