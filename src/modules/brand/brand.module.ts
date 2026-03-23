import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { BrandEntity } from "src/database/entities/brand.entity";
import { BrandService } from "./brand.service";
import { BrandRepository } from "src/shared/modules/common-brand/brand.repository";
import { BrandController } from "./brand.controller";
import { ProductRepository } from "src/shared/modules/common-product/product.repository";
import { StorageService } from "src/shared/modules/common-storage/storage.service";
import { FileRepository } from "src/shared/modules/files/file.repository";

@Module({
    imports: [TypeOrmModule.forFeature([BrandEntity])],
    providers: [BrandService, BrandRepository, ProductRepository, StorageService, FileRepository],
    controllers: [BrandController]
})
export class BrandModule {}