import { BaseEntity } from '../../shared/modules/base/base.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { ProductVariantEntity } from './product-variant.entity';

@Entity('variant-images')
export class VariantImageEntity extends BaseEntity {
  @Column({ name: 'variant_id', type: 'uuid' })
  variantId: string;

  @Column({ name: 'image_key', type: 'varchar', length: 255, nullable: true })
  imageKey: string;

  @ManyToOne(() => ProductVariantEntity, (variant) => variant.images, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'variant_id' })
  variant: ProductVariantEntity;
}
