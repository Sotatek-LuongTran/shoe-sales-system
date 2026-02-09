import { Injectable } from "@nestjs/common";
import { UserRepository } from "src/shared/modules/user/user.repository";
import { ChangePasswordDto } from "./dto/change-password.dto";

@Injectable()
export class UserService {
    constructor(private readonly userRepository: UserRepository) {}

}