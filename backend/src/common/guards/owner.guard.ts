import {
  Injectable,
  CanActivate,
  ExecutionContext,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { Role } from '@prisma/client';
@Injectable()
export class OwnerGuard implements CanActivate {
  constructor(private databaseService: DatabaseService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    // check if the user is admin
    if (user.role === Role.admin) return true;

    const postId = parseInt(request.params.id);
    // check if the post exists
    const post = await this.databaseService.post.findUnique({
      where: { id: postId },
    });
    // check if the post exists
    if (!post) throw new NotFoundException('Post not found');
    // check if the logged-in user is the author
    if (post.authorId !== user.id) {
      throw new ForbiddenException('You can only delete your own posts');
    }
    return true;
  }
}
