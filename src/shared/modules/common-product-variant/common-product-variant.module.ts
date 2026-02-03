import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ProductVariantEntity } from "src/database/entities/product-variant.entity";
import { ProductVariantRepository } from "./product-variant.repository";

@Module({
    imports: [TypeOrmModule.forFeature([ProductVariantEntity])],
    exports: [ProductVariantRepository]
})
export class CommonProductVariantModule {}
