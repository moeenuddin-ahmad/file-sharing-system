import { BadRequestException } from '@nestjs/common';
import { unlink } from 'fs/promises';

export const validateFile = async (
  file: Express.Multer.File,
  options: { maxSizeInMB: number; allowedMimetypes: string[] },
) => {
  const maxSize = options.maxSizeInMB * 1024 * 1024;

  if (
    !options.allowedMimetypes.includes(file.mimetype) ||
    file.size > maxSize
  ) {
    if (file.path) await unlink(file.path).catch(() => {});
    throw new BadRequestException(
      file.size > maxSize
        ? `File is too large! Max ${options.maxSizeInMB}MB`
        : 'Invalid file type! Only JPG, PNG, PDF, TXT and DOCX are allowed.',
    );
  }
};
