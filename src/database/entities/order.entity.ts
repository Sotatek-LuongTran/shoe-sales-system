import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { BaseEntity } from "../../shared/modules/base/base.entity";
import { OrderItemEntity } from "./order-item.entity";
import { PaymentEntity } from "./payment.entity";
import { UserEntity } from "./user.entity";
import { OrderPaymentStatus, OrderStatus } from "src/shared/enums/order.enum";

@Entity('orders')
@Index('idx_orders_created_at', ['createdAt'])
@Index('idx_orders_status', ['status'])
@Index('idx_orders_payment_status', ['paymentStatus'])
@Index('idx_orders_deleted_at', ['deletedAt'])
export class OrderEntity extends BaseEntity {
    @Column({ name: 'status', type: 'enum', enum: OrderStatus })
    status: OrderStatus;

    @Column({ name: 'payment_status', type: 'enum', enum: OrderPaymentStatus })
    paymentStatus: OrderPaymentStatus;

    @Column({ name: 'deleted_at', type: 'timestamp', nullable: true })
    deletedAt: Date | null;

    @Column({ name: 'user_id', type: 'uuid' })
    userId: string;

    @Column({ name: 'total_price', type: 'numeric', precision: 12, scale: 2 })
    totalPrice: number;

    // Relations
    @OneToMany(() => OrderItemEntity, (item) => item.order)
    items: OrderItemEntity[];  
    
    @OneToMany(() => PaymentEntity, (payment) => payment.order)
    payments: PaymentEntity[];

    @ManyToOne(() => UserEntity, (user) => user.orders)
    @JoinColumn({ name: 'user_id' })
    user: UserEntity;
}