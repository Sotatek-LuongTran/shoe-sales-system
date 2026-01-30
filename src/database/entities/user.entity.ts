import { Column, Entity } from "typeorm";
import { BaseEntity } from "./base.entity";

export enum UserRole {
    ADMIN = 'admin',
    USER = 'user',
}

@Entity('users')
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
}