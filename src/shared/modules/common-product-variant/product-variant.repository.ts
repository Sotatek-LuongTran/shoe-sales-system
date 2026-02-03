import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ProductVariantEntity } from "src/database/entities/product-variant.entity";
import { ProductVariantRepository } from "./common-product-variant.module";

@Module({
    imports: [TypeOrmModule.forFeature([ProductVariantEntity])],
    exports: [ProductVariantRepository]
})
export class CommonProductVariantModule {}