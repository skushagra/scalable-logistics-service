import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ClientProxy,
  ClientProxyFactory,
  Transport,
} from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { AcceptBookingDto } from '../dtos/accept-booking.dto';
import { UpdateJobStatusDto } from '../dtos/update-job-status.dto';

@Controller('drivers')
export class DriverController {
  private client: ClientProxy;

  constructor() {
    // Initialize Redis client for microservice communication
    this.client = ClientProxyFactory.create({
      transport: Transport.REDIS,
      options: { host: 'localhost', port: 6379 },
    });
  }

  @Post('register')
  async register(@Body() driverDto) {
    return firstValueFrom(
      this.client.send({ cmd: 'register_driver' }, driverDto),
    );
  }

  @Post('login')
  async login(@Body() driverLoginDto) {
    return firstValueFrom(
      this.client.send({ cmd: 'login_driver' }, driverLoginDto),
    );
  }

  @Get('profile')
  async getProfile(@Request() req) {
    const driverId = req.user.driverId;
    return firstValueFrom(
      this.client.send({ cmd: 'get_driver_profile' }, driverId),
    );
  }

  @Post('availability')
  async updateAvailability(
    @Request() req,
    @Body() data: { isAvailable: boolean },
  ) {
    const driverId = req.user.driverId;
    return firstValueFrom(
      this.client.send(
        { cmd: 'update_driver_availability' },
        { driverId, isAvailable: data.isAvailable },
      ),
    );
  }

  @Post('accept-booking')
  async acceptBooking(
    @Request() req,
    @Body() acceptBookingDto: AcceptBookingDto,
  ) {
    const driverId = req.user.driverId;
    return firstValueFrom(
      this.client.send(
        { cmd: 'accept_booking' },
        { driverId, acceptBookingDto },
      ),
    );
  }

  @Post('update-job-status')
  async updateJobStatus(
    @Request() req,
    @Body() updateJobStatusDto: UpdateJobStatusDto,
  ) {
    const driverId = req.user.driverId;
    return firstValueFrom(
      this.client.send(
        { cmd: 'update_job_status' },
        { driverId, updateJobStatusDto },
      ),
    );
  }
}
