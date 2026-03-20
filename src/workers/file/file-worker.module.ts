import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { DatabaseModule } from 'src/database/database.module';
import { StorageService } from 'src/shared/modules/common-storage/storage.service';
import { FileRepository } from 'src/shared/modules/files/file.repository';
import { RemoveFileJob } from './remove-file.job';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
  ],
  providers: [FileRepository, StorageService, RemoveFileJob],
})
export class FileWorkerModule {}
