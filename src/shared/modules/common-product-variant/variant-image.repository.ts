import { DataSource } from "typeorm";
import { BaseRepository } from "../base/base.repository";
import { VariantImageEntity } from "src/database/entities/variant-image.entity";
import { Injectable } from "@nestjs/common";

@Injectable()
export class VariantImageRepository extends BaseRepository<VariantImageEntity> {
    constructor(dataSource: DataSource) {
        super(dataSource, VariantImageEntity)
    }
}