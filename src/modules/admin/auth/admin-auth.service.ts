import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginDto } from 'src/modules/auth/dto/login.dto';
import { ErrorCodeEnum } from 'src/shared/enums/error-code.enum';
import { UserRepository } from 'src/shared/modules/user/user.repository';
import * as bcrypt from 'bcrypt';
import { UserRoleEnum } from 'src/shared/enums/user.enum';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AdminLoginDto } from './dto/admin-login.dto';

@Injectable()
export class AdminAuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: AdminLoginDto) {
    const user = await this.userRepository.findByEmail(dto.email);

    if (!user) {
      throw new UnauthorizedException({
        errorCode: ErrorCodeEnum.AUTH_INVALID_CREDENTIALS,
        statusCode: 401,
      });
    }

    if (user.role !== UserRoleEnum.ADMIN) {
      throw new ForbiddenException({
        errorCode: ErrorCodeEnum.AUTH_FORBIDDEN,
        statusCode: 403,
      });
    }

    const isPasswordValid = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException({
        errorCode: ErrorCodeEnum.AUTH_INVALID_CREDENTIALS,
        statusCode: 401,
      });
    }
    const accessPayload = {
      sub: user.id,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(accessPayload, {
      secret: this.configService.get('JWT_SECRET'),
      expiresIn: this.configService.get('JWT_EXPIRES_IN'),
    });

    return {
        accessToken: accessToken,
        message: 'Admin login successfully'
    }
  }
}
