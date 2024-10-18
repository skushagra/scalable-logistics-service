import {
  Injectable,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { Driver } from './entities/driver.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateDriverDto } from './dtos/create-driver.dto';
import { DriverLoginDto } from './dtos/driver-login.dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import {
  ClientProxy,
  ClientProxyFactory,
  Transport,
} from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class DriverService {
  private bookingClient: ClientProxy;

  constructor(
    @InjectRepository(Driver) private driverRepository: Repository<Driver>,
    private jwtService: JwtService,
  ) {
    // Initialize the client for communicating with Booking Service
    this.bookingClient = ClientProxyFactory.create({
      transport: Transport.REDIS,
      options: { host: 'redis', port: 6379 },
    });
  }

  async register(createDriverDto: CreateDriverDto): Promise<Partial<Driver>> {
    const { name, email, password, licenseNumber, vehicleType } =
      createDriverDto;

    // Check if the email already exists
    const existingDriver = await this.driverRepository.findOne({
      where: { email },
    });
    if (existingDriver) {
      throw new ConflictException('Email already exists');
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the driver
    const driver = this.driverRepository.create({
      name,
      email,
      password: hashedPassword,
      licenseNumber,
      vehicleType,
      isAvailable: false, // Default to not available
    });

    await this.driverRepository.save(driver);

    // Return the driver without the password
    const { password: _, ...result } = driver;
    return result;
  }

  async login(
    driverLoginDto: DriverLoginDto,
  ): Promise<{ accessToken: string }> {
    const { email, password } = driverLoginDto;

    const driver = await this.driverRepository.findOne({ where: { email } });
    if (!driver) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, driver.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate JWT
    const payload = { sub: driver.id, email: driver.email };
    const accessToken = this.jwtService.sign(payload);

    return { accessToken };
  }

  async updateAvailability(
    driverId: number,
    isAvailable: boolean,
  ): Promise<void> {
    const driver = await this.driverRepository.findOne({
      where: {
        id: driverId,
      },
    });
    if (!driver) {
      throw new NotFoundException('Driver not found');
    }

    driver.isAvailable = isAvailable;
    await this.driverRepository.save(driver);
  }

  async getProfile(driverId: number): Promise<Partial<Driver>> {
    const driver = await this.driverRepository.findOne({
      where: {
        id: driverId,
      },
    });
    if (!driver) {
      throw new NotFoundException('Driver not found');
    }

    const { password, ...result } = driver;
    return result;
  }

  async acceptBooking(driverId: number, bookingId: number): Promise<any> {
    // Verify that the driver exists
    const driver = await this.driverRepository.findOne({
      where: {
        id: driverId,
      },
    });
    if (!driver) {
      throw new NotFoundException('Driver not found');
    }

    // Communicate with Booking Service to accept the booking
    // Send a message to the Booking Service with driverId and bookingId
    return firstValueFrom(
      this.bookingClient.send(
        { cmd: 'driver_accept_booking' },
        { driverId, bookingId },
      ),
    );
  }

  async updateJobStatus(
    driverId: number,
    bookingId: number,
    status: string,
  ): Promise<any> {
    // Verify that the driver exists
    const driver = await this.driverRepository.findOne({
      where: {
        id: driverId,
      },
    });
    if (!driver) {
      throw new NotFoundException('Driver not found');
    }

    // Communicate with Booking Service to update the job status
    return firstValueFrom(
      this.bookingClient.send(
        { cmd: 'update_booking_status' },
        { driverId, bookingId, status },
      ),
    );
  }

  async getAvailableDrivers(vehicleType: string): Promise<any[]> {
    // Fetch drivers who are available and match the vehicle type
    const availableDrivers = await this.driverRepository.find({
      where: {
        isAvailable: true,
        vehicleType: vehicleType,
      },
      select: [
        'id',
        'name',
        'vehicleType',
        'currentLatitude',
        'currentLongitude',
      ],
    });

    if (availableDrivers.length === 0) {
      throw new NotFoundException(
        'No available drivers found for the specified vehicle type',
      );
    }

    // Map drivers to include currentLocation object
    const driversWithLocation = availableDrivers.map((driver) => ({
      id: driver.id,
      name: driver.name,
      vehicleType: driver.vehicleType,
      currentLocation: {
        latitude: driver.currentLatitude,
        longitude: driver.currentLongitude,
      },
    }));

    return driversWithLocation;
  }

  async updateCurrentLocation(
    driverId: number,
    latitude: number,
    longitude: number,
  ): Promise<void> {
    const driver = await this.driverRepository.findOne({
      where: { id: driverId },
    });
    if (!driver) {
      throw new NotFoundException('Driver not found');
    }

    driver.currentLatitude = latitude;
    driver.currentLongitude = longitude;

    await this.driverRepository.save(driver);
  }
}
