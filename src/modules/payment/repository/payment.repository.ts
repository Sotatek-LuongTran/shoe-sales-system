import { Injectable } from "@nestjs/common";
import { PaymentEntity } from "src/database/entities/payment.entity";
import { BaseRepository } from "src/shared/modules/base/base.repository";
import { DataSource } from "typeorm";

@Injectable()
export class PaymentRepository extends BaseRepository<PaymentEntity> {
    constructor(datasource: DataSource) {
        super(datasource, PaymentEntity)
    }

    async findByIdWithOrder(id: string): Promise<PaymentEntity | null> {
        return this.findOne({
            where: { id },
            relations: ['order'],
        });
    }
}