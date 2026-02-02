import { Injectable } from '@nestjs/common';
import { UserEntity } from '../../../database/entities/user.entity';
import { BaseRepository } from '../base/base.repository';
import { DataSource } from 'typeorm';

@Injectable()
export class UserRepository extends BaseRepository<UserEntity> {
  constructor(dataSource: DataSource) {
    super(dataSource, UserEntity);
  }

  async findByEmail(email: string) {
    return this.repository.findOne({
      where: {
        email,
      },
    });
  }
}
