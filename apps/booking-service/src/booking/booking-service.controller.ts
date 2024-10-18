import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { BookingService } from './booking-service.service';
import { CreateBookingDto } from './dtos/create-booking.dto';
import { AssignDriverDto } from './dtos/assign-driver.dto';
import { UpdateBookingStatusDto } from './dtos/update-booking-status.dto';
import { PriceEstimationDto } from './dtos/price-estimation.dto';
import { DriverService } from 'apps/driver-service/src/driver/driver-service.service';

@Controller()
export class BookingController {
  constructor(private readonly bookingService: BookingService, private readonly driverService: DriverService) {}

  @MessagePattern({ cmd: 'create_booking' })
  async createBooking(@Payload() createBookingDto: CreateBookingDto) {
    return this.bookingService.createBooking(createBookingDto);
  }

  @MessagePattern({ cmd: 'get_booking' })
  async getBooking(@Payload() bookingId: number) {
    return this.bookingService.getBookingById(bookingId);
  }

  @MessagePattern({ cmd: 'driver_accept_booking' })
  async driverAcceptBooking(
    @Payload() data: { driverId: number; bookingId: number },
  ) {
    return this.bookingService.assignDriver(data.bookingId, data.driverId);
  }

  @MessagePattern({ cmd: 'update_booking_status' })
  async updateBookingStatus(
    @Payload() data: { driverId: number; bookingId: number; status: string },
  ) {
    return this.bookingService.updateStatus(
      data.bookingId,
      data.status,
      data.driverId,
    );
  }

  @MessagePattern({ cmd: 'estimate_price' })
  async estimatePrice(@Payload() priceEstimationDto: PriceEstimationDto) {
    const estimatedCost =
      await this.bookingService.estimatePrice(priceEstimationDto);
    return { estimatedCost };
  }

  @MessagePattern({ cmd: 'get_available_drivers' })
  async getAvailableDrivers(@Payload() vehicleType: string) {
    return this.driverService.getAvailableDrivers(vehicleType);
  }
}
