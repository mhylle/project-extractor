import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GeneratePackageModule } from './features/generate-package/generate-package.module';

@Module({
  imports: [GeneratePackageModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
