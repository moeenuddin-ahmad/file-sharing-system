import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { unlink } from 'fs/promises';
import { DatabaseService } from 'src/database/database.service';
import { EventsGateway } from 'src/events/events.gateway';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { FiltersDto } from 'src/common/dto/filters.dto';
import { paginate } from 'src/common/utils/pagination.util';

@Injectable()
export class FileService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly eventsGateway: EventsGateway,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async upload(file: Express.Multer.File, fileSpaceId: number) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // 1. Validate File Type & Size
    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'application/pdf',
      'text/plain',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!allowedMimeTypes.includes(file.mimetype) || file.size > maxSize) {
      if (file.path) await unlink(file.path).catch(() => {});
      throw new BadRequestException(
        file.size > maxSize
          ? 'File is too large! Max 10MB'
          : 'Invalid file type! Only JPG, PNG, PDF, TXT and DOCX are allowed.',
      );
    }

    // 2. Verify that the FileSpace exists
    const fileSpace = await this.databaseService.fileSpace.findUnique({
      where: { id: fileSpaceId },
    });

    if (!fileSpace) {
      // Cleanup the uploaded file since the space doesn't exist
      if (file.path) await unlink(file.path).catch(() => {});
      throw new NotFoundException(`FileSpace with ID ${fileSpaceId} not found`);
    }

    // 2. Save metadata to Database
    try {
      const fileRecord = await this.databaseService.file.create({
        data: {
          name: file.originalname,
          originalName: file.originalname,
          storedName: file.filename,
          path: file.path,
          mimeType: file.mimetype,
          size: BigInt(file.size),
          fileSpaceId: fileSpaceId,
        },
      });

      // Invalidate Cache for this space
      await this.cacheManager.del(`/file/${fileSpaceId}`);

      // Trigger frontend refresh
      this.eventsGateway.informFileSpace(fileSpaceId);

      return {
        message: 'File uploaded successfully!',
        file: {
          ...fileRecord,
          size: fileRecord.size.toString(),
        },
      };
    } catch (error) {
      // Cleanup on DB error
      if (file.path) await unlink(file.path).catch(() => {});
      throw new InternalServerErrorException(
        'Failed to save file metadata to database',
      );
    }
  }

  async findAll(fileSpaceId: number, query: FiltersDto) {
    return paginate(
      this.databaseService.file,
      query,
      ['name', 'originalName'],
      { fileSpaceId },
    );
  }

  async remove(id: number) {
    const file = await this.databaseService.file.findUnique({
      where: { id },
    });

    if (!file) {
      throw new NotFoundException(`File with ID ${id} not found`);
    }

    // Delete from DB
    await this.databaseService.file.delete({
      where: { id },
    });

    // Delete from Disk
    await unlink(file.path).catch((err) => {
      console.error('Failed to delete file from disk during removal:', err);
    });

    // Invalidate Cache for this space
    await this.cacheManager.del(`/file/${file.fileSpaceId}`);

    // Trigger frontend refresh
    this.eventsGateway.informFileSpace(file.fileSpaceId);
    return { message: 'File removed successfully' };
  }
}
