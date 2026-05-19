import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class FileSpaceService {
  constructor(private readonly databaseService: DatabaseService) {}

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
}
