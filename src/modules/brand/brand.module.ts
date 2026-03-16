import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { BrandEntity } from "src/database/entities/brand.entity";
import { BrandService } from "./brand.service";
import { BrandRepository } from "src/shared/modules/common-brand/brand.repository";
import { BrandController } from "./brand.controller";
import { ProductRepository } from "src/shared/modules/common-product/product.repository";
import { StorageService } from "src/shared/modules/storage/storage.service";

@Module({
    imports: [TypeOrmModule.forFeature([BrandEntity])],
    providers: [BrandService, BrandRepository, ProductRepository, StorageService],
    controllers: [BrandController]
})
export class BrandModule {}