import { Column, DeleteDateColumn, Entity, Index, OneToMany } from "typeorm";
import { BaseEntity } from "../../shared/modules/base/base.entity";
import { OrderEntity } from "./order.entity";
import { UserRoleEnum } from "../../shared/enums/user.enum";

@Entity('users')
@Index('idx_users_email_deleted_at', ['email', 'deletedAt'])
@Index('idx_users_role_deleted_at', ['role', 'deletedAt'])
@Index('idx_users_created_at', ['createdAt'])
export class UserEntity extends BaseEntity {
    @Column({name: 'name', type: 'varchar', length: 255 })
    name: string;

    @Column({name: 'email', type: 'varchar', length: 255 })
    email: string;

    @Column({name: 'password_hash', type: 'varchar', length: 255 })
    passwordHash: string;

    @Column({ name: 'role', type: 'enum', enum: UserRoleEnum })
    role: UserRoleEnum;

    // @Column({ name: 'deleted_at', type: 'timestamp', nullable: true })
    @DeleteDateColumn({ name: 'deleted_at' })
    deletedAt: Date | null;

    // Relations
    @OneToMany(() => OrderEntity, (order) => order.user)
    orders: OrderEntity[];
}

