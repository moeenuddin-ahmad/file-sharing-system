import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { writeFile, mkdir, unlink } from 'fs/promises';
import { DatabaseService } from 'src/database/database.service';
import { join } from 'path';

@Injectable()
export class FileService {
  constructor(private readonly databaseService: DatabaseService) {}

  async upload(file: Express.Multer.File, fileSpaceId: number) {
    // 1. Verify that the FileSpace exists
    const fileSpace = await this.databaseService.fileSpace.findUnique({
      where: { id: fileSpaceId },
    });

    if (!fileSpace) {
      throw new NotFoundException(`FileSpace with ID ${fileSpaceId} not found`);
    }

    const uploadDir = './uploads';

    // 2. Ensure the upload directory exists
    await mkdir(uploadDir, { recursive: true });

    // 3. Define names and path
    const timestamp = Date.now();
    const storedName = `${timestamp}-${file.originalname}`;
    const uploadPath = join(uploadDir, storedName);

    // 4. Save file to disk

    await writeFile(uploadPath, file.buffer).catch((err) => {
      throw new InternalServerErrorException('Failed to write file to disk');
    });
u
    // 5. Save metadata to Database
    try {
      const fileRecord = await this.databaseService.file.create({
        data: {
          name: file.originalname,
          originalName: file.originalname,
          storedName: storedName,
          path: uploadPath,
          mimeType: file.mimetype,
          size: BigInt(file.size),
          fileSpaceId: fileSpaceId,
        },
      });

      return {
        message: 'File uploaded successfully!',
        file: {
          ...fileRecord,
          size: fileRecord.size.toString(),
        },
      };
    } catch (error) {
      await unlink(uploadPath).catch((err) => {
        console.error('Failed to cleanup file after DB error:', err);
      });
      throw new InternalServerErrorException(
        'Failed to save file metadata to database',
      );
    }
  }

  findAll() {
    return this.databaseService.file.findMany();
  }

  findOne(id: number) {
    return this.databaseService.file.findUnique({
      where: { id },
    });
  }

  async remove(id: number) {
    const file = await this.findOne(id);
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

    return { message: 'File removed successfully' };
  }
}
