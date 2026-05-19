import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { FileSpaceService } from './file-space.service';
import { FileSpaceDto, UpdateFileSpaceDto } from './dto/file-space.dto';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { OwnerGuard } from 'src/common/guards/owner.guard';

@Controller('file-space')
@UseGuards(AuthGuard)
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
  @UseGuards(OwnerGuard)
  update(@Param('id') id: string, @Body() dto: UpdateFileSpaceDto) {
    return this.fileSpaceService.update(+id, dto);
  }

  @Delete(':id')
  @UseGuards(OwnerGuard)
  remove(@Param('id') id: string) {
    return this.fileSpaceService.remove(+id);
  }
}
