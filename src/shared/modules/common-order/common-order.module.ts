import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { OrderEntity } from "src/database/entities/order.entity";
import { OrderRepository } from "./order.repository";

@Module({
    imports: [TypeOrmModule.forFeature([OrderEntity])],
    exports: [OrderRepository]
})
export class OrderModule {}