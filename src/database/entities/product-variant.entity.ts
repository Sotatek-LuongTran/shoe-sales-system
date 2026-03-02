import {
  Column,
  Entity,
  Index,
  ManyToOne,
  JoinColumn,
  Check,
  DeleteDateColumn,
} from 'typeorm';
import { BaseEntity } from '../../shared/modules/base/base.entity';
import { ProductEntity } from './product.entity';
import { VariantStatusEnum } from '../../shared/enums/product-variant';

@Entity('product_variants')
@Index(
  'idx_product_variants_product_id_variant_value',
  ['productId', 'variantValue'],
  { unique: true },
)
@Index('idx_product_variants_product_id', ['productId'])
@Check(`"price" >= 0`)
@Check(`"stock" >= 0`)
@Check(`"reserved_stock >=0`)
@Check(`"reserved_stock <= stock`)
export class ProductVariantEntity extends BaseEntity {
  @Column({ name: 'variant_value', type: 'varchar', length: 100 })
  variantValue: string;

  @Column({ name: 'price', type: 'numeric', precision: 12, scale: 4 })
  price: number;

  @Column({ name: 'stock', type: 'int', default: 0 })
  stock: number;

  @Column({ name: 'reserved_stock', type: 'int', default: 0 })
  reservedStock: number;

  // @Column({ name: 'is_active', type: 'boolean', default: true })
  // isActive: boolean;

  @Column({
    name: 'status',
    type: 'enum',
    enum: VariantStatusEnum,
  })
  status: VariantStatusEnum;

  // @Column({ name: 'deleted_at', type: 'timestamp', nullable: true })
  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date | null;

  @Column({ name: 'product_id', type: 'uuid' })
  productId: string;

  // Relations
  @ManyToOne(() => ProductEntity, (product) => product.variants, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'product_id' })
  product: ProductEntity;
}
