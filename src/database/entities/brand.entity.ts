import { Column, Entity, OneToMany, Index } from "typeorm";
import { BaseEntity } from "./base.entity";
import { ProductEntity } from "./product.entity";

@Entity('brands')
@Index('idx_brands_name_deleted_at', ['name', 'deletedAt'])
export class BrandEntity extends BaseEntity {
    @Column({name:'name', type: 'varchar', length: 255})
    name: string;

    @Column({name:'description', type: 'text', nullable: true})
    description: string;

    @Column({ name: 'deleted_at', type: 'timestamp', nullable: true })
    deletedAt: Date | null;

    // Relations
    @OneToMany(() => ProductEntity, (product) => product.brand)
    products: ProductEntity[];
}