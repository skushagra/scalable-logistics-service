import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UserService } from './user-service.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { UserLoginDto } from './dtos/user-login.dto';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @MessagePattern({ cmd: 'register_user' })
  async registerUser(@Payload() data: CreateUserDto) {
    return this.userService.register(data);
  }

  @MessagePattern({ cmd: 'get_user' })
  async getUserById(@Payload() id: number) {
    return this.userService.findById(id);
  }

  @MessagePattern({ cmd: 'login_user' })
  async loginUser(@Payload() data: UserLoginDto) {
    return this.userService.login(data);
  }
}
