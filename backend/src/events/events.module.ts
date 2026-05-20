import { Module, Global } from '@nestjs/common';
import { EventsGateway } from './events.gateway';
import { DatabaseModule } from 'src/database/database.module';
import { JwtServices } from 'src/common/services/jwt.utls';

@Global()
@Module({
  imports: [DatabaseModule],
  providers: [EventsGateway, JwtServices],
  exports: [EventsGateway],
})
export class EventsModule {}
