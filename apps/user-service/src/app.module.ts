import { Module } from '@nestjs/common';
import { UserModule } from './user/user-service.module';

@Module({
  imports: [UserModule],
})
export class AppModule {}
