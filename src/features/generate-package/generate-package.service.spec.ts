import { Test, TestingModule } from '@nestjs/testing';
import { GeneratePackageService } from './generate-package.service';

describe('GeneratePackageService', () => {
  let service: GeneratePackageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GeneratePackageService],
    }).compile();

    service = module.get<GeneratePackageService>(GeneratePackageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
