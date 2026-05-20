import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DatabaseService } from 'src/database/database.service';
import { EventsGateway } from 'src/events/events.gateway';

@Injectable()
export class FileSpaceService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly eventsGateway: EventsGateway,
  ) {}

  async create(userId: number, data: Prisma.FileSpaceCreateInput) {
    return this.databaseService.$transaction(async (tx) => {
      const fileSpace = await tx.fileSpace.create({
        data,
      });

      await tx.fileSpaceMember.create({
        data: {
          fileSpaceId: fileSpace.id,
          userId: userId,
          role: 'OWNER',
        },
      });

      return fileSpace;
    });
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
      return await this.databaseService.fileSpace.update({
        where: { id },
        data,
      });
    } catch (error) {
      throw new NotFoundException(`FileSpace with ID ${id} not found`);
    }
  }

  async remove(id: number) {
    try {
      return await this.databaseService.fileSpace.delete({
        where: { id },
      });
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

    // Check if mapping already exists
    const existingMember = await this.databaseService.fileSpaceMember.findFirst(
      {
        where: { userId, fileSpaceId },
      },
    );

    if (existingMember) {
      return { message: 'You are already a member of this FileSpace' };
    }

    const member = await this.databaseService.fileSpaceMember.create({
      data: {
        userId,
        fileSpaceId,
        role: 'MEMBER',
      },
    });

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
    if (member.role === 'OWNER') {
      throw new Error('Owners cannot leave a FileSpace');
    }

    const deleted = await this.databaseService.fileSpaceMember.delete({
      where: { id: member.id },
    });

    // 2. Leave user from room via Gateway
    this.eventsGateway.leaveUserFromFileSpace(userId, fileSpaceId);

    return deleted;
  }

  async getActiveUsers(fileSpaceId: number) {
    return this.eventsGateway.getActiveUsersInFileSpace(fileSpaceId);
  }
}
