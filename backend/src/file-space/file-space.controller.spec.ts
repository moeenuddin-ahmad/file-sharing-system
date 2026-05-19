import { Test, TestingModule } from '@nestjs/testing';
import { FileSpaceController } from './file-space.controller';
import { FileSpaceService } from './file-space.service';

describe('FileSpaceController', () => {
  let controller: FileSpaceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FileSpaceController],
      providers: [FileSpaceService],
    }).compile();

    controller = module.get<FileSpaceController>(FileSpaceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
