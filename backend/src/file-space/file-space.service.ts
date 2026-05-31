import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, role } from '@prisma/client';
import { DatabaseService } from 'src/database/database.service';
import { EventsGateway } from 'src/events/events.gateway';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

@Injectable()
export class FileSpaceService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly eventsGateway: EventsGateway,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async create(userId: number, data: Prisma.FileSpaceCreateInput) {
    const fileSpace = await this.databaseService.$transaction(async (tx) => {
      const fs = await tx.fileSpace.create({
        data,
      });

      await tx.fileSpaceMember.create({
        data: {
          fileSpaceId: fs.id,
          userId: userId,
          role: role.OWNER,
        },
      });

      return fs;
    });

    // Invalidate list cache
    await this.cacheManager.del('/file-space');

    return fileSpace;
  }

  async findAll() {
    return this.databaseService.fileSpace.findMany();
  }

  async findOne(id: number) {
    const fileSpace = await this.databaseService.fileSpace.findUnique({
      where: { id },
    });

    if (!fileSpace) {
      throw new NotFoundException(`FileSpace with ID ${id} not found`);
    }

    return fileSpace;
  }

  async update(id: number, data: Prisma.FileSpaceUpdateInput) {
    try {
      const updated = await this.databaseService.fileSpace.update({
        where: { id },
        data,
      });

      // Invalidate caches
      await this.cacheManager.del('/file-space');
      await this.cacheManager.del(`/file-space/${id}`);

      return updated;
    } catch (error) {
      throw new NotFoundException(`FileSpace with ID ${id} not found`);
    }
  }

  async remove(id: number) {
    try {
      const deleted = await this.databaseService.fileSpace.delete({
        where: { id },
      });

      // Invalidate caches
      await this.cacheManager.del('/file-space');
      await this.cacheManager.del(`/file-space/${id}`);
      await this.cacheManager.del(`/file-space/${id}/members`);
      await this.cacheManager.del(`/file-space/${id}/active-users`);

      return deleted;
    } catch (error) {
      throw new NotFoundException(`FileSpace with ID ${id} not found`);
    }
  }

  async join(userId: number, fileSpaceId: number) {
    // Check if FileSpace exists
    const fileSpace = await this.findOne(fileSpaceId);

    if (!fileSpace) {
      throw new NotFoundException(`FileSpace with ID ${fileSpaceId} not found`);
    }

    // Check if member already exists
    const existingMember = await this.databaseService.fileSpaceMember.findFirst(
      {
        where: { userId, fileSpaceId },
      },
    );

    if (existingMember) {
      this.eventsGateway.joinUserToFileSpace(userId, fileSpaceId);
      return { message: 'You are already a member of this FileSpace' };
    }

    const member = await this.databaseService.fileSpaceMember.create({
      data: {
        userId,
        fileSpaceId,
        role: role.MEMBER,
      },
    });

    // Invalidate caches
    await this.cacheManager.del(`/file-space/${fileSpaceId}/members`);
    await this.cacheManager.del(`/file-space/${fileSpaceId}/active-users`);

    // 1. Join user to room via Gateway
    this.eventsGateway.joinUserToFileSpace(userId, fileSpaceId);

    return member;
  }

  async leave(userId: number, fileSpaceId: number) {
    const member = await this.databaseService.fileSpaceMember.findFirst({
      where: { userId, fileSpaceId },
    });

    if (!member) {
      throw new NotFoundException('Membership not found');
    }

    // Prevent the OWNER from leaving
    if (member.role === role.OWNER) {
      throw new Error('Owners cannot leave a FileSpace');
    }

    const deleted = await this.databaseService.fileSpaceMember.delete({
      where: { id: member.id },
    });

    // Invalidate caches
    await this.cacheManager.del(`/file-space/${fileSpaceId}/members`);
    await this.cacheManager.del(`/file-space/${fileSpaceId}/active-users`);

    // 2. Leave user from room via Gateway
    this.eventsGateway.leaveUserFromFileSpace(userId, fileSpaceId);

    return deleted;
  }

  async getMembers(fileSpaceId: number) {
    return this.databaseService.fileSpaceMember.findMany({
      where: { fileSpaceId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async getActiveUsers(fileSpaceId: number) {
    const userIds = this.eventsGateway.getActiveUsersInFileSpace(fileSpaceId);

    if (userIds.length === 0) {
      return [];
    }

    return this.databaseService.user.findMany({
      where: {
        id: { in: userIds },
      },
      select: {
        id: true,
        name: true,
      },
    });
  }
}
