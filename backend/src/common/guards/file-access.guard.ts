import {
  Injectable,
  CanActivate,
  ExecutionContext,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { role } from '@prisma/client';

@Injectable()
export class FileAccessGuard implements CanActivate {
  constructor(private databaseService: DatabaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const fileId = parseInt(request.params.id);

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    if (isNaN(fileId)) {
      throw new NotFoundException('Invalid File ID');
    }

    // 1. Find the file to see which FileSpace it belongs to
    const file = await this.databaseService.file.findUnique({
      where: { id: fileId },
    });

    if (!file) {
      throw new NotFoundException('File not found');
    }

    // 2. Check if the user is a MEMBER or OWNER of that FileSpace
    const membership = await this.databaseService.fileSpaceMember.findFirst({
      where: {
        fileSpaceId: file.fileSpaceId,
        userId: user.id,
        role: { in: [role.OWNER, role.MEMBER] },
      },
    });

    if (!membership) {
      throw new ForbiddenException(
        'You do not have permission to delete files in this space',
      );
    }

    return true;
  }
}
