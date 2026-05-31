import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  ParseFilePipeBuilder,
  HttpStatus,
  UseGuards,
  Query,
} from '@nestjs/common';
import { FileService } from './file.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { FileAccessGuard } from 'src/common/guards/file-access.guard';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { FiltersDto } from 'src/common/dto/filters.dto';

@Controller('file')
@UseGuards(AuthGuard)
@UseInterceptors(CacheInterceptor)
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  upload(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: '.(png|jpeg|jpg|pdf|txt|docx)',
        })
        .addMaxSizeValidator({
          maxSize: 1024 * 1024 * 10, // 10MB
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    file: Express.Multer.File,
    @Body('fileSpaceId') fileSpaceId: string,
  ) {
    return this.fileService.upload(file, +fileSpaceId);
  }

  @Get(':fileSpaceId')
  findAll(
    @Param('fileSpaceId') fileSpaceId: string,
    @Query() query: FiltersDto,
  ) {
    return this.fileService.findAll(+fileSpaceId, query);
  }

  @Delete(':id')
  @UseGuards(FileAccessGuard)
  remove(@Param('id') id: string) {
    return this.fileService.remove(+id);
  }
}
