import { Module } from '@nestjs/common';
import { StorageController } from './storage.controller';
import { StorageService } from 'src/shared/modules/common-storage/storage.service';

@Module({
  imports: [],
  providers: [StorageService],
  exports: [StorageService],
  controllers: [StorageController],
})
export class StorageModule {}
