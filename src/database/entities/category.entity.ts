import { Column, Entity, OneToMany, Index, DeleteDateColumn } from 'typeorm';
import { BaseEntity } from '../../shared/modules/base/base.entity';
import { ProductEntity } from './product.entity';
import { CategoryStatusEnum } from '../../shared/enums/category.enum';

@Entity('categories')
@Index('idx_categories_name_deleted_at', ['name', 'deletedAt'])
export class CategoryEntity extends BaseEntity {
  @Column({ name: 'name', type: 'varchar', length: 255 })
  name: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description: string;

  @Column({ name: 'status', type: 'enum', enum: CategoryStatusEnum })
  status: CategoryStatusEnum;

  // @Column({ name: 'logo_key', type: 'varchar', length: 255, nullable: true })
  // logoKey: string;

  // @Column({ name: 'deleted_at', type: 'timestamp', nullable: true })
  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date | null;

  // Relations
  @OneToMany(() => ProductEntity, (product) => product.category)
  products: ProductEntity[];
}
