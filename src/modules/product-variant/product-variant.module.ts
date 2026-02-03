import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ProductVariantEntity } from "src/database/entities/product-variant.entity";
import { ProductVariantService } from "./product-variant.service";
import { ProductVariantController } from "./product-variant.controller";
import { ProductVariantRepository } from "src/shared/modules/common-product-variant/product-variant.repository";
import { ProductRepository } from "src/shared/modules/common-product/product.repository";

@Module({
    imports: [TypeOrmModule.forFeature([ProductVariantEntity])],
    providers: [ProductVariantService, ProductVariantRepository, ProductRepository],
    controllers: [ProductVariantController]
})
export class ProductVariantModule {}