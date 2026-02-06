import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CategoryRepository } from "./category.repository";
import { CategoryEntity } from "src/database/entities/category.entity";

@Module({
    imports: [TypeOrmModule.forFeature([CategoryEntity])],
    exports: [CategoryRepository]
})
export class CommonBrandModule {}