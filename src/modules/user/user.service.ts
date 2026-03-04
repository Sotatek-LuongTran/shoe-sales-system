import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { UserRepository } from 'src/shared/modules/common-user/user.repository';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ErrorCodeEnum } from 'src/shared/enums/error-code.enum';
import * as bcrypt from 'bcrypt';
import { UserResponseDto } from 'src/shared/dto/user/user-response.dto';
import { error } from 'console';
@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

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
}
