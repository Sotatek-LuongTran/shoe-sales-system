import { Module } from '@nestjs/common';
import { StorageController } from './storage.controller';
import { StorageService } from 'src/shared/modules/common-storage/storage.service';
import { FileRepository } from 'src/shared/modules/files/file.repository';

@Module({
  imports: [],
  providers: [StorageService, FileRepository],
  exports: [StorageService],
  controllers: [StorageController],
})
export class StorageModule {}
