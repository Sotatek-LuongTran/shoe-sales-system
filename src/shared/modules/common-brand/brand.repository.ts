import { BrandEntity } from "src/database/entities/brand.entity";
import { BaseRepository } from "../base/base.repository";
import { DataSource } from "typeorm";
import { Injectable } from "@nestjs/common";

@Injectable()
export class BrandRepository extends BaseRepository<BrandEntity> {
    constructor(datasource: DataSource){
        super(datasource, BrandEntity)
    }

    async findByName(name: string){
        return this.repository.findOne({
            where: {
                name
            }
        })
    }
}