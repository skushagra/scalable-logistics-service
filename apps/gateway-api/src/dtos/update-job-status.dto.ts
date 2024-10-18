import { IsNumber, IsString } from 'class-validator';

export class UpdateJobStatusDto {
  @IsNumber()
  bookingId: number;

  @IsString()
  status: string;
}
