import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { StorageService } from 'src/shared/modules/common-storage/storage.service';
import { FileRepository } from 'src/shared/modules/files/file.repository';

@Injectable()
export class RemoveFileJob {
  constructor(
    private readonly fileRepository: FileRepository,
    private readonly storageService: StorageService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  //   @Cron(CronExpression.EVERY_10_SECONDS)
  async removeUnusedFiles() {
    const unusedFiles = await this.fileRepository.findUnusedFiles();
    console.log(`Found ${unusedFiles.length} unused files`);

    for (const file of unusedFiles) {
      console.log('Delete file: ' + file.key);
      await this.storageService.deleteFile(file.key);
      await this.fileRepository.delete(file);
    }
  }
}
