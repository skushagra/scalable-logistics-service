import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Booking } from './entities/booking.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateBookingDto } from './dtos/create-booking.dto';
import { PriceEstimationDto } from './dtos/price-estimation.dto';
import {
  ClientProxy,
  ClientProxyFactory,
  Transport,
} from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { Client } from '@googlemaps/google-maps-services-js';

@Injectable()
export class BookingService {
  private driverClient: ClientProxy;
  private googleMapsClient: Client;
  private readonly logger = new Logger(BookingService.name);

  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
    private readonly configService: ConfigService,
  ) {
    // Initialize the client for communicating with Driver Service
    this.driverClient = ClientProxyFactory.create({
      transport: Transport.REDIS,
      options: { host: 'redis', port: 6379 },
    });

    // Initialize the Google Maps Client
    this.googleMapsClient = new Client({});
  }

  async createBooking(createBookingDto: CreateBookingDto): Promise<Booking> {
    // Estimate the price
    const estimatedCost = await this.estimatePrice(createBookingDto);

    // Geocode the pickup and drop-off locations to get coordinates
    const pickupCoordinates = await this.getCoordinates(
      createBookingDto.pickupLocation,
    );
    const dropOffCoordinates = await this.getCoordinates(
      createBookingDto.dropOffLocation,
    );

    // Create the booking
    const booking = this.bookingRepository.create({
      ...createBookingDto,
      estimatedCost,
      status: 'pending',
      pickupLatitude: pickupCoordinates.latitude,
      pickupLongitude: pickupCoordinates.longitude,
      dropOffLatitude: dropOffCoordinates.latitude,
      dropOffLongitude: dropOffCoordinates.longitude,
    });

    const savedBooking = await this.bookingRepository.save(booking);

    // Match a driver
    const driverId = await this.matchDriver(savedBooking);
    if (driverId) {
      // Assign the driver
      savedBooking.driverId = driverId;
      savedBooking.status = 'accepted';
      await this.bookingRepository.save(savedBooking);

      // Optionally, notify the Driver Service or the driver
    }

    return savedBooking;
  }

  async assignDriver(bookingId: number, driverId: number): Promise<Booking> {
    const booking = await this.bookingRepository.findOne({
      where: { id: bookingId },
    });
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    booking.driverId = driverId;
    booking.status = 'accepted';

    return this.bookingRepository.save(booking);
  }

  async updateStatus(
    bookingId: number,
    status: string,
    driverId?: number,
  ): Promise<Booking> {
    const booking = await this.bookingRepository.findOne({
      where: { id: bookingId },
    });
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (driverId && booking.driverId !== driverId) {
      throw new NotFoundException('Driver not assigned to this booking');
    }

    booking.status = status;
    return this.bookingRepository.save(booking);
  }

  async getBookingById(bookingId: number): Promise<Booking> {
    const booking = await this.bookingRepository.findOne({
      where: { id: bookingId },
    });
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }
    return booking;
  }

  async estimatePrice(priceEstimationDto: PriceEstimationDto): Promise<number> {
    const distance = await this.calculateDistance(
      priceEstimationDto.pickupLocation,
      priceEstimationDto.dropOffLocation,
    );
    const vehicleMultiplier = this.getVehicleMultiplier(
      priceEstimationDto.vehicleType,
    );
    const baseRate = 100; // INR 100 per km

    return distance * baseRate * vehicleMultiplier;
  }

  private getVehicleMultiplier(vehicleType: string): number {
    // Define multipliers for different vehicle types
    const multipliers = {
      Truck: 1.5,
      Van: 1.2,
      Car: 1.0,
    };
    return multipliers[vehicleType] || 1.0;
  }

  private async calculateDistance(
    pickup: string,
    dropOff: string,
  ): Promise<number> {
    try {
      const apiKey = this.configService.get<string>('GOOGLE_MAPS_API_KEY');

      const response = await this.googleMapsClient.distancematrix({
        params: {
          origins: [pickup],
          destinations: [dropOff],
          key: apiKey,
        },
      });

      const element = response.data.rows[0].elements[0];

      if (element.status === 'OK') {
        // Distance in meters
        const distanceInMeters = element.distance.value;
        // Convert to kilometers
        const distanceInKilometers = distanceInMeters / 1000;
        return distanceInKilometers;
      } else {
        throw new Error('Distance calculation failed');
      }
    } catch (error) {
      this.logger.error('Error calculating distance:', error);
      throw new Error('Error calculating distance');
    }
  }

  private async getCoordinates(
    address: string,
  ): Promise<{ latitude: number; longitude: number }> {
    try {
      const apiKey = this.configService.get<string>('GOOGLE_MAPS_API_KEY');

      const response = await this.googleMapsClient.geocode({
        params: {
          address: address,
          key: apiKey,
        },
      });

      if (response.data.status === 'OK') {
        const location = response.data.results[0].geometry.location;
        return { latitude: location.lat, longitude: location.lng };
      } else {
        throw new Error('Geocoding failed');
      }
    } catch (error) {
      this.logger.error('Error geocoding address:', error);
      throw new Error('Error geocoding address');
    }
  }

  private calculateDistanceBetweenCoordinates(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
    const R = 6371; // Earth's radius in kilometers

    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRadians(lat1)) *
        Math.cos(toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distance = R * c; // Distance in kilometers
    return distance;
  }

  async matchDriver(booking: Booking): Promise<number> {
    try {
      // Extract necessary details from the booking
      const { vehicleType, pickupLatitude, pickupLongitude } = booking;

      const pickupLocation = {
        latitude: pickupLatitude,
        longitude: pickupLongitude,
      };

      // Request available drivers from the Driver Service
      const availableDrivers = await firstValueFrom(
        this.driverClient.send({ cmd: 'get_available_drivers' }, vehicleType),
      );

      if (!availableDrivers || availableDrivers.length === 0) {
        this.logger.warn('No available drivers found');
        throw new Error('No available drivers found');
      }

      // Find the driver closest to the pickup location
      let closestDriver = null;
      let minDistance = Number.MAX_SAFE_INTEGER;

      for (const driver of availableDrivers) {
        const driverLatitude = driver.currentLatitude;
        const driverLongitude = driver.currentLongitude;

        if (driverLatitude == null || driverLongitude == null) {
          continue; // Skip drivers without a current location
        }

        const distance = this.calculateDistanceBetweenCoordinates(
          pickupLocation.latitude,
          pickupLocation.longitude,
          driverLatitude,
          driverLongitude,
        );

        if (distance < minDistance) {
          minDistance = distance;
          closestDriver = driver;
        }
      }

      if (!closestDriver) {
        this.logger.warn('No suitable driver found');
        throw new Error('No suitable driver found');
      }

      await firstValueFrom(
        this.driverClient.send(
          { cmd: 'update_driver_availability' },
          { driverId: closestDriver.id, isAvailable: false },
        ),
      );

      return closestDriver.id;
    } catch (error) {
      this.logger.error(`Error matching driver: ${error.message}`);
      throw error;
    }
  }
}
