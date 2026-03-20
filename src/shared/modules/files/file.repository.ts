import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../base/base.repository';
import { FileEntity } from 'src/database/entities/file.entity';
import { DataSource, LessThan } from 'typeorm';
import { FileStatusEnum } from 'src/shared/enums/file-status.enum';

@Injectable()
export class FileRepository extends BaseRepository<FileEntity> {
  constructor(dataSource: DataSource) {
    super(dataSource, FileEntity);
  }

  async findUnusedFiles() {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    return this.find({
      where: {
        status: FileStatusEnum.INACTIVE,
        updatedAt: LessThan(oneMonthAgo),
      },
    });
  }

  async findFileByKey(key: string) {
    return this.findOne({
      where: {
        key: key,
      },
    });
  }
}
