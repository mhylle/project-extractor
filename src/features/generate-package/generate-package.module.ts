import { Module } from '@nestjs/common';
import { GeneratePackageController } from './generate-package.controller';
import { GeneratePackageService } from './generate-package.service';

@Module({
  controllers: [GeneratePackageController],
  providers: [GeneratePackageService]
})
export class GeneratePackageModule {}
