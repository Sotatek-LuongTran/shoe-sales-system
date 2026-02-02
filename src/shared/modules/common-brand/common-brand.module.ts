import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { BrandEntity } from "src/database/entities/brand.entity";
import { BrandRepository } from "./brand.repository";

@Module({
    imports: [TypeOrmModule.forFeature([BrandEntity])],
    exports: [BrandRepository]
})
export class CommonBrandModule {}