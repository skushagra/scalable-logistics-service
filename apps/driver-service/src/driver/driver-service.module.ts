import { Module } from '@nestjs/common';
import { DriverService } from './driver-service.service';
import { DriverController } from './driver-service.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Driver } from './entities/driver.entity';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './constants';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost', // Adjust if necessary
      port: 5432, // Adjust if necessary
      username: 'postgres',
      password: 'password',
      database: 'logistics',
      entities: [Driver],
      synchronize: true, // Set to false in production
    }),
    TypeOrmModule.forFeature([Driver]),
    PassportModule,
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '1h' }, // Token expires in 1 hour
    }),
  ],
  controllers: [DriverController],
  providers: [DriverService, JwtStrategy],
})
export class DriverModule {}
