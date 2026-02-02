import { Module } from "@nestjs/common";
import { BaseEntity } from "./base.entity";
import { BaseRepository } from "./base.repository";

@Module({
    exports: [BaseEntity, BaseRepository]
})
export class BaseModule {}