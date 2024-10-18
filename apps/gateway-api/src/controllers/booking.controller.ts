import { Controller, Post, Body, Get, Param, Request } from '@nestjs/common';
import {
  ClientProxy,
  ClientProxyFactory,
  Transport,
} from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Controller('bookings')
export class BookingController {
  private client: ClientProxy;

  constructor() {
    // Initialize Redis client for microservice communication
    this.client = ClientProxyFactory.create({
      transport: Transport.REDIS,
      options: { port: 6379, host: 'localhost' },
    });
  }

  @Post()
  async createBooking(@Request() req, @Body() bookingDto) {
    const userId = req.user.userId;
    const createBookingDto = { ...bookingDto, userId };
    return firstValueFrom(
      this.client.send({ cmd: 'create_booking' }, createBookingDto),
    );
  }

  @Get(':id')
  async getBooking(@Param('id') id: string) {
    return firstValueFrom(
      this.client.send({ cmd: 'get_booking' }, parseInt(id, 10)),
    );
  }

  @Post('estimate-price')
  async estimatePrice(@Body() priceEstimationDto) {
    return firstValueFrom(
      this.client.send({ cmd: 'estimate_price' }, priceEstimationDto),
    );
  }
}
