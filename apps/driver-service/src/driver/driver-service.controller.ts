import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { DriverService } from './driver-service.service';
import { CreateDriverDto } from './dtos/create-driver.dto';
import { DriverLoginDto } from './dtos/driver-login.dto';
import { UpdateAvailabilityDto } from './dtos/update-availability.dto';
import { AcceptBookingDto } from './dtos/accept-booking.dto';
import { UpdateJobStatusDto } from './dtos/update-job-status.dto';
import { UpdateLocationDto } from './dtos/update-location.dto';

@Controller()
export class DriverController {
  constructor(private readonly driverService: DriverService) {}

  @MessagePattern({ cmd: 'register_driver' })
  async registerDriver(@Payload() data: CreateDriverDto) {
    return this.driverService.register(data);
  }

  @MessagePattern({ cmd: 'login_driver' })
  async loginDriver(@Payload() data: DriverLoginDto) {
    return this.driverService.login(data);
  }

  @MessagePattern({ cmd: 'update_driver_availability' })
  async updateAvailability(
    @Payload() data: { driverId: number; isAvailable: boolean },
  ) {
    return this.driverService.updateAvailability(
      data.driverId,
      data.isAvailable,
    );
  }

  @MessagePattern({ cmd: 'get_driver_profile' })
  async getDriverProfile(@Payload() driverId: number) {
    return this.driverService.getProfile(driverId);
  }

  @MessagePattern({ cmd: 'accept_booking' })
  async acceptBooking(
    @Payload() data: { driverId: number; acceptBookingDto: AcceptBookingDto },
  ) {
    const { driverId, acceptBookingDto } = data;
    return this.driverService.acceptBooking(
      driverId,
      acceptBookingDto.bookingId,
    );
  }

  @MessagePattern({ cmd: 'update_job_status' })
  async updateJobStatus(
    @Payload()
    data: {
      driverId: number;
      updateJobStatusDto: UpdateJobStatusDto;
    },
  ) {
    const { driverId, updateJobStatusDto } = data;
    return this.driverService.updateJobStatus(
      driverId,
      updateJobStatusDto.bookingId,
      updateJobStatusDto.status,
    );
  }

  @MessagePattern({ cmd: 'get_available_drivers' })
  async getAvailableDrivers(@Payload() vehicleType: string) {
    return this.driverService.getAvailableDrivers(vehicleType);
  }

  @MessagePattern({ cmd: 'update_driver_location' })
  async updateCurrentLocation(@Payload() data: UpdateLocationDto) {
    const { driverId, latitude, longitude } = data;
    return this.driverService.updateCurrentLocation(
      driverId,
      latitude,
      longitude,
    );
  }
}
