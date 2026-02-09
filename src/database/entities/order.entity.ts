import { Column, DeleteDateColumn, Entity, Index, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { BaseEntity } from "../../shared/modules/base/base.entity";
import { OrderItemEntity } from "./order-item.entity";
import { PaymentEntity } from "./payment.entity";
import { UserEntity } from "./user.entity";
import { OrderPaymentStatusEnum, OrderStatusEnum } from "../../shared/enums/order.enum";

@Entity('orders')
@Index('idx_orders_user_status',['user', 'status'], { unique: true })
export class OrderEntity extends BaseEntity {
    @Column({ name: 'status', type: 'enum', enum: OrderStatusEnum })
    status: OrderStatusEnum;

    @Column({ name: 'payment_status', type: 'enum', enum: OrderPaymentStatusEnum })
    paymentStatus: OrderPaymentStatusEnum;

    // @Column({ name: 'deleted_at', type: 'timestamp', nullable: true })
    @DeleteDateColumn()
    deletedAt: Date | null;

    @Column({ name: 'user_id', type: 'uuid' })
    userId: string;

    @Column({ name: 'total_price', type: 'numeric', precision: 12, scale: 4 })
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