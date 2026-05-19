import { Module } from '@nestjs/common';
import { FileSpaceService } from './file-space.service';
import { FileSpaceController } from './file-space.controller';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [FileSpaceController],
  providers: [FileSpaceService],
})
export class FileSpaceModule {}
