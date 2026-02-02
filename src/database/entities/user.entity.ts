import { Column, Entity, Index, OneToMany } from "typeorm";
import { BaseEntity } from "./base.entity";
import { OrderEntity } from "./order.entity";

export enum UserRole {
    ADMIN = 'admin',
    USER = 'user',
}

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
    password_hash: string;

    @Column({ name: 'role', type: 'enum', enum: UserRole })
    role: UserRole;

    @Column({ name: 'deleted_at', type: 'timestamp', nullable: true })
    deletedAt: Date | null;

    // Relations
    @OneToMany(() => OrderEntity, (order) => order.user)
    orders: OrderEntity[];
}