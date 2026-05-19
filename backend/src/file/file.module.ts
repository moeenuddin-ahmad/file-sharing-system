import { Module } from '@nestjs/common';
import { FileService } from './file.service';
import { FileController } from './file.controller';
import { DatabaseModule } from 'src/database/database.module';
import { JwtServices } from 'src/common/services/jwt.utls';
import { FileAccessGuard } from 'src/common/guards/file-access.guard';

@Module({
  imports: [DatabaseModule],
  controllers: [FileController],
  providers: [FileService, JwtServices, FileAccessGuard],
})
export class FileModule {}
