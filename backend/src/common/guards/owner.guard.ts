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
export class OwnerGuard implements CanActivate {
  constructor(private databaseService: DatabaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const fileSpaceId = parseInt(request.params.id);

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    if (isNaN(fileSpaceId)) {
      throw new NotFoundException('Invalid FileSpace ID');
    }

    // Check if the user is an OWNER of the FileSpace
    const membership = await this.databaseService.fileSpaceMember.findFirst({
      where: {
        fileSpaceId,
        userId: user.id,
        role: role.OWNER,
      },
    });

    if (!membership) {
      throw new ForbiddenException('You are not the owner of this FileSpace');
    }

    return true;
  }
}
