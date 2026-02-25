import {
  Column,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { BaseEntity } from '../../shared/modules/base/base.entity';
import { OrderItemEntity } from './order-item.entity';
import { PaymentEntity } from './payment.entity';
import { UserEntity } from './user.entity';
import {
  OrderPaymentStatusEnum,
  OrderStatusEnum,
} from '../../shared/enums/order.enum';

@Entity('orders')
export class OrderEntity extends BaseEntity {
  @Column({ name: 'status', type: 'enum', enum: OrderStatusEnum})
  status: OrderStatusEnum;

  @Column({
    name: 'payment_status',
    type: 'enum',
    enum: OrderPaymentStatusEnum,
  })
  paymentStatus: OrderPaymentStatusEnum;

  @Column({ name: 'expires_at', type: 'timestamp' })
  expiresAt: Date;

    // @Column({ name: 'deleted_at', type: 'timestamp', nullable: true })
    @DeleteDateColumn({ name: 'deleted_at'})
    deletedAt: Date | null;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'total_price', type: 'numeric', precision: 12, scale: 4 })
  totalPrice: number;

  // Relations
  @OneToMany(() => OrderItemEntity, (item) => item.order)
  items: OrderItemEntity[];

  @OneToOne(() => PaymentEntity, (payment) => payment.order, {
    cascade: true,
  })
  payment: PaymentEntity;

  @ManyToOne(() => UserEntity, (user) => user.orders)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;
}
