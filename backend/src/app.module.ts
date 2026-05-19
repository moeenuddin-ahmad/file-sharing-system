import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { FileSpaceModule } from './file-space/file-space.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    JwtModule.register({
      global: true,
      secret: '123',
      signOptions: { expiresIn: '60s' },
    }),
    DatabaseModule,
    UsersModule,
    FileSpaceModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
