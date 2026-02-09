import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UserRepository } from 'src/shared/modules/user/user.repository';
import { CreateUserDto } from '../user/dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { LoginDto } from '../user/dto/login.dto';
import { RedisService } from '../../common/redis/redis.service';
import { randomUUID } from 'crypto';
import { UserRoleEnum } from 'src/shared/enums/user.enum';

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
      throw new BadRequestException('Email already in use');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const user = await this.usersRepo.create({
      email: createUserDto.email,
      name: createUserDto.name,
      passwordHash: hashedPassword,
      role: UserRoleEnum.USER,
      deletedAt: null,
    });

    await this.usersRepo.save(user)

    return {
      user: {
        userId: user.id,
        email: user.email,
        name: user.name,
      },
      message: 'User registered successfully',
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersRepo.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Password is wrong');
    }
    const sessionKey = randomUUID();

    const accessPayload = { sub: user.id, role: user.role, sessionKey };
    const accessToken = this.jwtService.sign(accessPayload, {
      secret: this.configService.get('JWT_SECRET'),
      expiresIn: this.configService.get('JWT_EXPIRES_IN'),
    });

    // Refresh token only stores sessionKey (not entire payload user)
    const refreshPayload = { sessionKey };
    const refreshToken = this.jwtService.sign(refreshPayload, {
      secret:
        this.configService.get('JWT_REFRESH_SECRET') ??
        this.configService.get('JWT_SECRET'),
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN') ?? '7d',
    });

    // Save refresh token into Redis with TTL
    const refreshTtl =
      this.configService.get<number>('JWT_REFRESH_TTL_SECONDS') ??
      60 * 60 * 24 * 7;

    // Save mapping sessionKey -> userId (or refreshToken)
    await this.redisService.set(`refresh:${sessionKey}`, user.id, refreshTtl);

    return {
      accessToken,
      refreshToken,
      message: 'User log in successfully',
    };
  }

  async logout(sessionKey?: string, accessTokenExp?: number) {
    if (sessionKey) {
      // Calculate TTL for blacklist base on exp of access token
      let ttlSeconds: number | undefined;
      if (accessTokenExp) {
        const nowSeconds = Math.floor(Date.now() / 1000);
        ttlSeconds = Math.max(accessTokenExp - nowSeconds, 0);
      }

      // Put sessionKey into blacklist
      await this.redisService.set(
        `blacklist:session:${sessionKey}`,
        '1',
        ttlSeconds,
      );

      // Delete refresh corresponding sessionKey
      await this.redisService.del(`refresh:${sessionKey}`);
    }

    return { message: 'User logged out successfully' };
  }
}
