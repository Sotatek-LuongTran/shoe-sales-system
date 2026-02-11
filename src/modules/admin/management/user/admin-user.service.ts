import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from 'src/shared/modules/user/user.repository';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from 'src/modules/auth/dto/create-user.dto';
import { UpdateUserDto } from 'src/modules/admin/management/user/dto/update-user.dto';
import { RedisService } from 'src/common/redis/redis.service';
import { ErrorCodeEnum } from 'src/shared/enums/error-code.enum';

@Injectable()
export class AdminUserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly redisService: RedisService,
  ) {}

  async createUser(createUserDto: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    return this.userRepository.create({
      ...createUserDto,
      passwordHash: hashedPassword,
    });
  }

  async findAllUsers() {
    return this.userRepository.find();
  }

  async findUserById(id: string) {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException({
        errorCode: ErrorCodeEnum.USER_NOT_FOUND,
        status: 404,
      });
    }
    return user;
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException({
        errorCode: ErrorCodeEnum.USER_NOT_FOUND,
        status: 404,
      });
    }
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }
    return this.userRepository.update(id, updateUserDto);
  }

  async deactivateUser(userId: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException({
        errorCode: ErrorCodeEnum.USER_NOT_FOUND,
        status: 404,
      });
    }
    await this.redisService.incr(`user:tokenVersion:${userId}`);
    await this.redisService.del(`user:refreshToken:${userId}`); 
  }
}
