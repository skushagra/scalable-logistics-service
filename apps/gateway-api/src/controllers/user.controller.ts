import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import {
  ClientProxy,
  ClientProxyFactory,
  Transport,
} from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Controller('users')
export class UserController {
  private client: ClientProxy;

  constructor() {
    // Initialize Redis client for microservice communication
    this.client = ClientProxyFactory.create({
      transport: Transport.REDIS,
      options: { host: 'localhost', port: 6379 },
    });
  }

  @Post('register')
  async register(@Body() userDto) {
    return firstValueFrom(this.client.send({ cmd: 'register_user' }, userDto));
  }

  @Get(':id')
  async getUser(@Param('id') id: string) {
    return firstValueFrom(
      this.client.send({ cmd: 'get_user' }, parseInt(id, 10)),
    );
  }

  @Post('login')
  async login(@Body() userLoginDto) {
    return firstValueFrom(
      this.client.send({ cmd: 'login_user' }, userLoginDto),
    );
  }
}
