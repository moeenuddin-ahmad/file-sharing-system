import { Module } from '@nestjs/common';
import { FileSpaceService } from './file-space.service';
import { FileSpaceController } from './file-space.controller';
import { DatabaseModule } from 'src/database/database.module';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { OwnerGuard } from 'src/common/guards/owner.guard';
import { JwtServices } from 'src/common/services/jwt.utls';

@Module({
  imports: [DatabaseModule],
  controllers: [FileSpaceController],
  providers: [FileSpaceService, OwnerGuard, AuthGuard, JwtServices],
})
export class FileSpaceModule {}
