import {Injectable, Logger} from '@nestjs/common';
import * as fs from 'fs-extra';
import * as path from 'path';
import {simpleGit, SimpleGit} from "simple-git";


interface FolderStructure {
    [key: string]: FolderStructure | FileInfo[];
}

interface FileInfo {
    name: string;
    changed: boolean;
}


@Injectable()
export class GeneratePackageService {
    private readonly logger = new Logger(GeneratePackageService.name);
    private git: SimpleGit;

    constructor() {
        this.git = simpleGit();
    }

    async generatePackage(sourcePath: string, outputPath: string, clearOutput: boolean = true): Promise<void> {
        if (clearOutput) {
            await this.clearOutputFolder(outputPath);
        }

        const allFilesPath = path.join(outputPath, 'all_files');
        const changedFilesPath = path.join(outputPath, 'changed_files');
        await fs.ensureDir(allFilesPath);
        await fs.ensureDir(changedFilesPath);

        const folderStructure = await this.copyFilesRecursively(sourcePath, allFilesPath, changedFilesPath);
        await this.generateFolderStructureFile(folderStructure, outputPath);
    }

    private async clearOutputFolder(outputPath: string): Promise<void> {
        try {
            await fs.emptyDir(outputPath);
            this.logger.debug(`Cleared output folder: ${outputPath}`);
        } catch (error) {
            this.logger.error(`Error clearing output folder: ${error.message}`, error.stack);
            throw error;
        }
    }

    private async copyFilesRecursively(sourcePath: string, allFilesPath: string, changedFilesPath: string, structure: FolderStructure = {}): Promise<FolderStructure> {
        try {
            const entries = await fs.promises.readdir(sourcePath, { withFileTypes: true });
            const changedFiles = await this.getChangedFiles(sourcePath);

            for (const entry of entries) {
                const srcPath = path.join(sourcePath, entry.name);

                if (entry.isDirectory()) {
                    structure[entry.name] = {};
                    await this.copyFilesRecursively(srcPath, allFilesPath, changedFilesPath, structure[entry.name] as FolderStructure);
                } else {
                    const ext = path.extname(entry.name);
                    if (['.ts', '.scss', '.html'].includes(ext) && !entry.name.endsWith('.spec.ts')) {
                        const relativePath = path.relative(sourcePath, srcPath);
                        const flatFileName = relativePath.replace(/[\/\\]/g, '_');
                        const allFilesDestPath = path.join(allFilesPath, flatFileName);

                        await fs.copy(srcPath, allFilesDestPath);

                        const isChanged = changedFiles.includes(relativePath);
                        if (isChanged) {
                            const changedFilesDestPath = path.join(changedFilesPath, flatFileName);
                            await fs.copy(srcPath, changedFilesDestPath);
                        }

                        const parentFolder = path.dirname(relativePath);
                        if (!structure[parentFolder]) {
                            structure[parentFolder] = [];
                        }
                        (structure[parentFolder] as FileInfo[]).push({
                            name: entry.name,
                            changed: isChanged
                        });

                        this.logger.debug(`Copied file: ${relativePath}${isChanged ? ' (changed)' : ''}`);
                    }
                }
            }

            return structure;
        } catch (error) {
            this.logger.error(`Error copying files: ${error.message}`, error.stack);
            throw error;
        }
    }

    private async getChangedFiles(repoPath: string): Promise<string[]> {
        try {
            await this.git.cwd(repoPath);
            const status = await this.git.status();
            return status.files.map(file => file.path);
        } catch (error) {
            this.logger.error(`Error getting changed files: ${error.message}`, error.stack);
            return [];
        }
    }

    private async generateFolderStructureFile(structure: FolderStructure, outputPath: string): Promise<void> {
        try {
            const structureFilePath = path.join(outputPath, 'folder-structure.txt');
            const content = this.formatFolderStructure(structure);
            await fs.writeFile(structureFilePath, content);
            this.logger.debug(`Generated folder structure file: ${structureFilePath}`);
        } catch (error) {
            this.logger.error(`Error generating folder structure file: ${error.message}`, error.stack);
            throw error;
        }
    }

    private formatFolderStructure(structure: FolderStructure, indent: string = ''): string {
        let result = '';
        for (const [key, value] of Object.entries(structure)) {
            if (Array.isArray(value)) {
                result += `${indent}${key}/\n`;
                value.forEach(file => {
                    const changeIndicator = file.changed ? ' [CHANGED]' : '';
                    result += `${indent}  ${file.name}${changeIndicator}\n`;
                });
            } else {
                result += `${indent}${key}/\n`;
                result += this.formatFolderStructure(value, indent + '  ');
            }
        }
        return result;
    }
}
