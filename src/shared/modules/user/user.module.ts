import { Module } from "@nestjs/common";
import { UserRepository } from "./user.repository";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserEntity } from "src/database/entities/user.entity";

@Module({
    imports: [TypeOrmModule.forFeature([UserEntity])],
    exports: [UserRepository]
})
export class UserModule {}