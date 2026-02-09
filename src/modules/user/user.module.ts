import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserEntity } from "src/database/entities/user.entity";
import { UserRepository } from "src/shared/modules/user/user.repository";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";

@Module({
    imports: [TypeOrmModule.forFeature([UserEntity])],
    providers: [UserRepository, UserService],
    controllers: [UserController]
})
export class UserModule {}