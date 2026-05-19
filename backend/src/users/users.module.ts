import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { BcryptServices } from 'src/common/services/bcrypt.utils';
import { JwtServices } from 'src/common/services/jwt.utls';

@Module({
  controllers: [UsersController],
  providers: [UsersService, BcryptServices, JwtServices],
})
export class UsersModule {}
