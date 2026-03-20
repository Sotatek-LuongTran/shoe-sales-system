import { FileStatusEnum } from '../../shared/enums/file-status.enum';
import { BaseEntity } from '../../shared/modules/base/base.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { UserEntity } from './user.entity';

@Entity('files')
export class FileEntity extends BaseEntity {
  @Column({ name: 'key', type: 'varchar', length: '255' })
  key: string;

  @Column({ name: 'owner_id', type: 'uuid' })
  ownerId: string;

  @Column({ name: 'status', type: 'enum', enum: FileStatusEnum })
  status: FileStatusEnum;

  @ManyToOne(() => UserEntity, (user) => user.files)
  @JoinColumn({ name: 'owner_id' })
  user: UserEntity;
}
