import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../shared/modules/base/base.entity';
import { OrderEntity } from './order.entity';
import { PaymentStatusEnum } from '../../shared/enums/payment.enum';

@Entity('payments')
@Index('idx_payments_order_id', ['orderId'])
@Index('idx_payments_payment_status', ['paymentStatus'])
@Index('idx_payments_deleted_at', ['deletedAt'])
export class PaymentEntity extends BaseEntity {
  @Column({ name: 'amount', type: 'numeric', precision: 12, scale: 2 })
  amount: number;

  @Column({ name: 'payment_status', type: 'enum', enum: PaymentStatusEnum })
  paymentStatus: PaymentStatusEnum;

  @Column({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt: Date | null;

  @Column({ name: 'order_id', type: 'uuid' })
  orderId: string;

  // Relations
  @ManyToOne(() => OrderEntity, (order) => order.payments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'order_id' })
  order: OrderEntity;
}
