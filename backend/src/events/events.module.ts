import { Module, Global } from '@nestjs/common';
import { EventsGateway } from './events.gateway';
import { DatabaseModule } from 'src/database/database.module';

@Global()
@Module({
  imports: [DatabaseModule],
  providers: [EventsGateway],
  exports: [EventsGateway],
})
export class EventsModule {}
