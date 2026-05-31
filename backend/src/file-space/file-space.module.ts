import { Module } from '@nestjs/common';
import { FileSpaceService } from './file-space.service';
import { FileSpaceController } from './file-space.controller';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { OwnerGuard } from 'src/common/guards/owner.guard';

@Module({
  imports: [],
  controllers: [FileSpaceController],
  providers: [FileSpaceService, OwnerGuard, AuthGuard],
})
export class FileSpaceModule {}
