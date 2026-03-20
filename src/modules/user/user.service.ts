import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UserRepository } from 'src/shared/modules/common-user/user.repository';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ErrorCodeEnum } from 'src/shared/enums/error-code.enum';
import * as bcrypt from 'bcrypt';
import { UserResponseDto } from 'src/shared/dto/user/user-response.dto';
import { StringDecoder } from 'node:string_decoder';
import { FileRepository } from 'src/shared/modules/files/file.repository';
import { FileStatusEnum } from 'src/shared/enums/file-status.enum';
@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly fileRepository: FileRepository,
  ) {}

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UnauthorizedException({
        errorCode: ErrorCodeEnum.USER_NOT_FOUND,
        statusCode: 401,
        message: 'User not found',
      });
    }

    const isPasswordValid = await bcrypt.compare(
      dto.oldPassword,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException({
        errorCode: ErrorCodeEnum.USER_OLD_PASSWORD_MISMATCH,
        statusCode: 401,
        message: 'Old password mismatch',
      });
    }

    const newPasswordHash = await bcrypt.hash(dto.newPassword, 10);
    Object.assign(user, {
      ...user,
      passwordHash: newPasswordHash,
    });

    await this.userRepository.save(user);
  }

  async getProfile(id: string) {
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new NotFoundException({
        errorCode: ErrorCodeEnum.USER_NOT_FOUND,
        statusCode: 404,
        message: 'User not found',
      });
    }

    return new UserResponseDto(user);
  }

  async changeAvatar(userId: string, key: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UnauthorizedException({
        errorCode: ErrorCodeEnum.USER_NOT_FOUND,
        statusCode: 401,
        message: 'User not found',
      });
    }

    const file = await this.fileRepository.findFileByKey(key);
    if (!file) {
      throw new NotFoundException({
        errorCode: ErrorCodeEnum.FILE_NOT_FOUND,
        statusCode: 404,
        message: 'File not found',
      });
    }
    if (file.status === FileStatusEnum.INACTIVE) {
      throw new BadRequestException({
        errorCode: ErrorCodeEnum.FILE_INVALID_STATUS,
        statusCode: 404,
        message: 'File is inactive',
      });
    }

    file.status = FileStatusEnum.INACTIVE;
    await this.fileRepository.save(file);

    user.avatarKey = key;

    await this.userRepository.save(user);
  }
}
