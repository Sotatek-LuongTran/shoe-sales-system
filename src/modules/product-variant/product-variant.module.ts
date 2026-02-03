import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ProductVariantEntity } from "src/database/entities/product-variant.entity";
import { ProductVariantService } from "./product-variant.service";
import { ProductVariantController } from "./product-variant.controller";

@Module({
    imports: [TypeOrmModule.forFeature([ProductVariantEntity])],
    providers: [ProductVariantService, ProductVariantRepository],
    controllers: [ProductVariantController]
})
export class ProductVariantRepository {}