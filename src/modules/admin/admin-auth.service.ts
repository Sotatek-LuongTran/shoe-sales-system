import { Injectable } from "@nestjs/common";
import { UserRepository } from "src/shared/modules/user/user.repository";

@Injectable()
export class AdminAuthService {
    constructor(private readonly userRepository: UserRepository) {}

    async login() {}
}