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
import configuration from './config/configuration';
import { ConfigService } from '@nestjs/config';

@Global()
@Module({
  imports: [
    // config module configuration
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
      envFilePath:
        process.env.RUNNING_IN_DOCKER === 'true' ? '.env.prod' : '.env.local',
    }),
    // jwt module configuration
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        global: true,
        secret: config.get('jwt.secret'),
        signOptions: { expiresIn: config.get('jwt.expiresIn') },
      }),
    }),
    // cache module configuration
    CacheModule.registerAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        return {
          ttl: 60000, // 1 minute global TTL
          stores: [new KeyvRedis(config.get('redis.url'))],
        };
      },
    }),
    // serve static files from the uploads directory
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),
    // mail service configuration
    MailerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        transport: {
          host: config.get('email.host'),
          port: config.get('email.port'),
          secure: config.get('email.secure'),
          auth: {
            user: config.get('email.user'),
            pass: config.get('email.pass'),
          },
        },
      }),
    }),
    // multer configuration
    MulterModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        storage: diskStorage({
          destination: './uploads',
          filename: (req, file, cb) => {
            const timestamp = Date.now();
            const filename = `${timestamp}-${file.originalname}`;
            cb(null, filename);
          },
        }),
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
