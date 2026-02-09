import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../shared/modules/base/base.entity';
import { OrderEntity } from './order.entity';
import { GenderEnum, ProductTypeEnum } from '../../shared/enums/product.enum';
import { ProductEntity } from './product.entity';

@Entity('order_items')
@Index('idx_order_items_order_id', ['orderId'])
@Index('idx_order_items_product_type_gender', ['productType', 'gender'])
@Index('idx_order_items_created_at', ['createdAt'])
export class OrderItemEntity extends BaseEntity {  
  @Column({ name: 'order_id', type: 'uuid' })
  orderId: string;

  @Column({ name: 'name', type: 'varchar', length: 255 })
  name: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description: string;

  @Column({ name: 'product_type', type: 'enum', enum: ProductTypeEnum })
  productType: ProductTypeEnum;

  @Column({ name: 'gender', type: 'enum', enum: GenderEnum })
  gender: GenderEnum;

  @Column({ name: 'variant_value', type: 'varchar', length: 100 })
  variantValue: string;

  @Column({ type: 'numeric', precision: 12, scale: 4 })
  price: number;

  @Column({ name: 'quantity', type: 'int', default: 1 })
  quantity: number;

  @Column({ name: 'final_price', type: 'numeric', precision: 12, scale: 4 })
  finalPrice: number;

  @Column({ name: 'product_id', type: 'uuid' })
  productId: string;

  // Relations
  @ManyToOne(() => OrderEntity, (order) => order.items, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'order_id' })
  order: OrderEntity;
  
  @ManyToOne(() => ProductEntity, (product) => product.orderItems, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'product_id' })
  product: ProductEntity;
}
