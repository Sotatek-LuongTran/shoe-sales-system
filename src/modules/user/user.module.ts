import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserEntity } from "src/database/entities/user.entity";
import { UserRepository } from "src/shared/modules/common-user/user.repository";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";
import { StorageService } from "src/shared/modules/storage/storage.service";

@Module({
    imports: [TypeOrmModule.forFeature([UserEntity])],
    providers: [UserRepository, UserService, StorageService],
    controllers: [UserController]
})
export class UserModule {}