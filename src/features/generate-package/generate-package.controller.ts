import {Body, Controller, Post} from '@nestjs/common';
import {GeneratePackageService} from "./generate-package.service";

@Controller('generate-package')
export class GeneratePackageController {
    constructor(private readonly generatePackageService: GeneratePackageService) {
    }

    @Post()
    async generatePackage(@Body() body: { sourcePath: string; outputPath: string }) {
        const {sourcePath, outputPath} = body;
        await this.generatePackageService.generatePackage(sourcePath, outputPath);
        return {message: 'Package generated successfully'};
    }
}
