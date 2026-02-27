import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PaymentEntity } from "src/database/entities/payment.entity";
import { PaymentRepository } from "./payment.repository";

@Module({
    imports: [TypeOrmModule.forFeature([PaymentEntity])],
    exports: [PaymentRepository]
})
export class CommonPaymentModule {}