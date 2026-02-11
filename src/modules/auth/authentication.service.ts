import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UserRepository } from 'src/shared/modules/user/user.repository';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { RedisService } from '../../common/redis/redis.service';
import { UserRoleEnum } from 'src/shared/enums/user.enum';
import { UserResponseDto } from 'src/shared/dto/user/user-response.dto';
import { ErrorCodeEnum } from 'src/shared/enums/error-code.enum';

@Injectable()
export class AuthenticationService {
  constructor(
    private readonly usersRepo: UserRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
  ) {}

  async register(createUserDto: CreateUserDto) {
    const existing = await this.usersRepo.findByEmail(createUserDto.email);
    if (existing) {
      throw new BadRequestException({
        errorCode: ErrorCodeEnum.AUTH_EMAIL_EXISTED,
        statusCode: 400,
      });
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const user = this.usersRepo.create({
      email: createUserDto.email,
      name: createUserDto.name,
      passwordHash: hashedPassword,
      role: UserRoleEnum.USER,
      deletedAt: null,
    });

    await this.usersRepo.save(user);

    return new UserResponseDto(user);
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersRepo.findByEmail(loginDto.email);

    if (!user) {
      throw new UnauthorizedException({
        errorCode: ErrorCodeEnum.AUTH_INVALID_CREDENTIALS,
        statusCode: 401,
      });
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException({
        errorCode: ErrorCodeEnum.AUTH_INVALID_CREDENTIALS,
        statusCode: 401,
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
      expiresIn: this.configService.get('JWT_EXPIRES_IN'),
    });

    const refreshPayload = {
      sub: user.id,
      tokenVersion: version,
    };

    const refreshToken = this.jwtService.sign(refreshPayload, {
      secret:
        this.configService.get('JWT_REFRESH_SECRET') ??
        this.configService.get('JWT_SECRET'),
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN') ?? '7d',
    });

    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

    const refreshTtl =
      this.configService.get<number>('JWT_REFRESH_TTL_SECONDS') ??
      60 * 60 * 24 * 7;

    await this.redisService.set(
      `user:refreshToken:${user.id}`,
      hashedRefreshToken,
      refreshTtl,
    );

    await this.redisService.setWithNumber(
      `user:tokenVersion:${user.id}`,
      version,
      refreshTtl,
    );

    return {
      accessToken,
      message: 'User logged in successfully',
    };
  }
}
