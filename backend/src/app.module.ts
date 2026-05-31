import { Module, Global } from '@nestjs/common';
import { CacheUtilsService } from './common/services/cache.utils';
import { JwtServices } from './common/services/jwt.utls';
import { BcryptServices } from './common/services/bcrypt.utils';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { FileSpaceModule } from './file-space/file-space.module';
import { FileModule } from './file/file.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { MailServices } from './common/services/mail.utils';
import { EventsModule } from './events/events.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { CacheModule } from '@nestjs/cache-manager';
import KeyvRedis from '@keyv/redis';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { join } from 'path';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async () => {
        return {
          ttl: 60000, // 1 minute global TTL
          stores: [new KeyvRedis(process.env.REDIS_URL)],
        };
      },
    }),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),
    // mail service configuration
    MailerModule.forRootAsync({
      useFactory: () => ({
        transport: {
          host: process.env.EMAIL_HOST,
          port: Number(process.env.EMAIL_PORT),
          secure: process.env.EMAIL_SECURE === 'true',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        },
      }),
    }),
    JwtModule.register({
      global: true,
      secret: '123',
      signOptions: { expiresIn: '60s' },
    }),
    // multer configuration
    MulterModule.register({
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const timestamp = Date.now();
          const filename = `${timestamp}-${file.originalname}`;
          cb(null, filename);
        },
      }),
    }),
    DatabaseModule,
    UsersModule,
    FileSpaceModule,
    FileModule,
    EventsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    MailServices,
    CacheUtilsService,
    JwtServices,
    BcryptServices,
  ],
  exports: [
    MailServices,
    CacheUtilsService,
    JwtServices,
    BcryptServices,
    MulterModule,
  ],
})
export class AppModule {}
