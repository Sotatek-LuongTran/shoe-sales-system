import { Column, Entity, Index, ManyToOne, JoinColumn, Check, DeleteDateColumn } from 'typeorm';
import { BaseEntity } from '../../shared/modules/base/base.entity';
import { ProductEntity } from './product.entity';

@Entity('product_variants')
@Index('idx_product_variants_product_id_variant_value', ['productId', 'variantValue'], { unique: true })
@Index('idx_product_variants_product_id', ['productId'])
@Check(`"price" >= 0`)
@Check(`"stock" >= 0`)
export class ProductVariantEntity extends BaseEntity {
  @Column({ name: 'variant_value', type: 'varchar', length: 100 })
  variantValue: string;

  @Column({ name: 'price', type: 'numeric', precision: 12, scale: 4 })
  price: number;

  @Column({ name: 'stock', type: 'int', default: 0 })
  stock: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

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
