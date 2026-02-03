import { Module } from "@nestjs/common";
import { ProductRepository } from "./product.repository";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ProductEntity } from "src/database/entities/product.entity";

@Module({
    imports: [TypeOrmModule.forFeature([ProductEntity])],
    exports: [ProductRepository]
})
export class CommonProductModule{}