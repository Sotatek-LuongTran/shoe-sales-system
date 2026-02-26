import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ErrorCodeEnum } from 'src/shared/enums/error-code.enum';
import { UserRepository } from 'src/shared/modules/common-user/user.repository';
import * as bcrypt from 'bcrypt';
import { UserRoleEnum } from 'src/shared/enums/user.enum';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AdminLoginDto } from './dto/admin-login.dto';
import { RedisService } from 'src/common/redis/redis.service';

@Injectable()
export class AdminAuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
  ) {}

  async login(dto: AdminLoginDto) {
    const user = await this.userRepository.findByEmail(dto.email);

    if (!user) {
      throw new UnauthorizedException({
        errorCode: ErrorCodeEnum.AUTH_INVALID_CREDENTIALS,
        statusCode: 401,
        message: 'Invalid credentials',
      });
    }

    if (user.role !== UserRoleEnum.ADMIN) {
      throw new ForbiddenException({
        errorCode: ErrorCodeEnum.AUTH_FORBIDDEN,
        statusCode: 403,
        message: 'Forbidden resource',
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
        message: 'Invalid credentials',
      });
    }

    let version = await this.redisService.getAsNumber(
      `user:tokenVersion:${user.id}`,
    );

    if (version === null || version === undefined) {
      version = 0;
    }

    const accessPayload = {
      sub: user.id,
      role: user.role,
      tokenVersion: version,
    };

    const accessToken = this.jwtService.sign(accessPayload, {
      secret: this.configService.get('JWT_SECRET'),
      expiresIn: this.configService.get('JWT_ADMIN_EXPIRES_IN'),
    });

    const refreshTtl =
      this.configService.get<number>('JWT_REFRESH_TTL_SECONDS') ??
      60 * 60 * 24 * 7;

    await this.redisService.setWithNumber(
      `user:tokenVersion:${user.id}`,
      version,
      refreshTtl,
    );

    return {
      accessToken: accessToken,
      message: 'Admin login successfully',
    };
  }
}
