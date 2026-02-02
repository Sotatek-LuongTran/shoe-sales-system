import { Column, Entity, ManyToOne, OneToMany, JoinColumn, Index } from "typeorm";
import { BaseEntity } from "../../shared/modules/base/base.entity";
import { BrandEntity } from "./brand.entity";
import { CategoryEntity } from "./category.entity";
import { ProductVariantEntity } from "./product-variant.entity";
import { OrderItemEntity } from "./order-item.entity";

export enum ProductType {
    SHOE = 'shoe',
    CLOTHING = 'clothing',
    ACCESSORY = 'accessory',
}

export enum Gender {
    MALE = 'male',
    FEMALE = 'female',
    UNISEX = 'unisex',
}

@Entity('products')
@Index('idx_products_brand_id', ['brandId'])
@Index('idx_products_category_id', ['categoryId'])
@Index('idx_products_brand_id_category_id_is_active_deleted_at', ['brandId', 'categoryId', 'isActive', 'deletedAt'])
export class ProductEntity extends BaseEntity{
    @Column({name:'name', type: 'varchar', length: 255})
    name: string;

    @Column({name:'description', type: 'text', nullable: true})
    description: string;

    @Column({ name: 'product_type', type: 'enum', enum: ProductType })
    productType: ProductType;

    @Column({ name: 'gender', type: 'enum', enum: Gender })
    gender: Gender;

    @Column({ name: 'is_active', type: 'boolean', default: true})
    isActive: boolean;

    @Column({ name: 'deleted_at', type: 'timestamp', nullable: true })
    deletedAt: Date | null;

    @Column({ name: 'brand_id', type: 'uuid' })
    brandId: string;

    @Column({ name: 'category_id', type: 'uuid' })
    categoryId: string;

    // Relations
    @ManyToOne(() => BrandEntity, (brand) => brand.products, {
        onDelete: 'RESTRICT',
    })
    @JoinColumn({ name: 'brand_id' })
    brand: BrandEntity;

    @ManyToOne(() => CategoryEntity, (category) => category.products, {
        onDelete: 'RESTRICT',
    })
    @JoinColumn({ name: 'category_id' })
    category: CategoryEntity;

    @OneToMany(() => ProductVariantEntity, (variant) => variant.product)
    variants: ProductVariantEntity[];
    
    @OneToMany(() => OrderItemEntity, (item) => item.product)
    orderItems: OrderItemEntity[];
}