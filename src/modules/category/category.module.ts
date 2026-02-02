import { Module } from "@nestjs/common";
import { CategoryService } from "./category.service";
import { CategoryController } from "./category.controller";
import { CategoryRepository } from "src/shared/modules/common-category/category.repository";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CategoryEntity } from "src/database/entities/category.entity";
import { ProductRepository } from "src/shared/modules/common-product/product.repository";

@Module({
    imports: [TypeOrmModule.forFeature([CategoryEntity])],
    providers: [CategoryService, CategoryRepository, ProductRepository],
    controllers: [CategoryController],
})
export class CategoryModule {}