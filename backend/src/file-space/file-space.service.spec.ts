import { Test, TestingModule } from '@nestjs/testing';
import { FileSpaceService } from './file-space.service';

describe('FileSpaceService', () => {
  let service: FileSpaceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FileSpaceService],
    }).compile();

    service = module.get<FileSpaceService>(FileSpaceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
