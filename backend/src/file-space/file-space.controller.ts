import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { FileSpaceService } from './file-space.service';
import { FileSpaceDto, UpdateFileSpaceDto } from './dto/file-space.dto';

@Controller('file-space')
export class FileSpaceController {
  constructor(private readonly fileSpaceService: FileSpaceService) {}

  @Post()
  create(@Body() dto: FileSpaceDto) {
    return this.fileSpaceService.create(dto);
  }

  @Get()
  findAll() {
    return this.fileSpaceService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.fileSpaceService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateFileSpaceDto) {
    return this.fileSpaceService.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.fileSpaceService.remove(+id);
  }
}
