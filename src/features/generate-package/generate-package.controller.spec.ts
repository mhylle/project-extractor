import { Test, TestingModule } from '@nestjs/testing';
import { GeneratePackageController } from './generate-package.controller';

describe('GeneratePackageController', () => {
  let controller: GeneratePackageController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GeneratePackageController],
    }).compile();

    controller = module.get<GeneratePackageController>(GeneratePackageController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
