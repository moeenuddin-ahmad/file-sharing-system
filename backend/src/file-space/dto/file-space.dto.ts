import { PartialType } from '@nestjs/mapped-types';
import { IsString, IsNotEmpty } from 'class-validator';

export class FileSpaceDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}

export class UpdateFileSpaceDto extends PartialType(FileSpaceDto) {}
