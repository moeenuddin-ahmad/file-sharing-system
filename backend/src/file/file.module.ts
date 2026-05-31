import { Module } from '@nestjs/common';
import { FileService } from './file.service';
import { FileController } from './file.controller';
import { DatabaseModule } from 'src/database/database.module';
import { FileAccessGuard } from 'src/common/guards/file-access.guard';
import { MulterModule } from '@nestjs/platform-express';

@Module({
  imports: [DatabaseModule, MulterModule],
  controllers: [FileController],
  providers: [FileService, FileAccessGuard],
})
export class FileModule {}
