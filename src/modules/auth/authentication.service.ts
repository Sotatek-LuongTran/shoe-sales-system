import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UserRepository } from 'src/shared/modules/common-user/user.repository';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { RedisService } from '../../common/redis/redis.service';
import { UserRoleEnum, UserStatusEnum } from 'src/shared/enums/user.enum';
import { UserResponseDto } from 'src/shared/dto/user/user-response.dto';
import { ErrorCodeEnum } from 'src/shared/enums/error-code.enum';
import { MailerService } from 'src/shared/modules/mailer/mailer.service';
import * as crypto from 'crypto';
import { RegistrationOtpDto } from './dto/registration-otp.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ChangePasswordDto } from '../user/dto/change-password.dto';
import { NewPasswordDto } from './dto/new-password.dto';

@Injectable()
export class AuthenticationService {
  constructor(
    private readonly usersRepo: UserRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
    private readonly mailerService: MailerService,
  ) {}

  async register(createUserDto: CreateUserDto) {
    const existing = await this.usersRepo.findByEmail(createUserDto.email);
    if (existing) {
      throw new BadRequestException({
        errorCode: ErrorCodeEnum.AUTH_EMAIL_EXISTED,
        statusCode: 400,
        message: 'Email already existed',
      });
    }

    const otp = await this.generateOtp(createUserDto.email);
    const otpExpiresIn =
      this.configService.get<number>('OTP_EXPIRES_IN') ?? 300;
    const otpExpiresInMins = otpExpiresIn / 60;

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const user = this.usersRepo.create({
      email: createUserDto.email,
      name: createUserDto.name,
      passwordHash: hashedPassword,
      role: UserRoleEnum.USER,
      deletedAt: null,
      status: UserStatusEnum.INACTIVE,
    });

    await this.usersRepo.save(user);

    await this.mailerService.sendApprovalEmail(user.email, {
      approver: user.email,
      otp: otp,
      expiresIn: otpExpiresInMins.toString(),
    });

    return new UserResponseDto(user);
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersRepo.findByEmail(loginDto.email);

    if (!user) {
      throw new UnauthorizedException({
        errorCode: ErrorCodeEnum.AUTH_INVALID_CREDENTIALS,
        statusCode: 401,
        message: 'Invalid email',
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
        message: 'Invalid password',
      });
    }

    if (user.status === UserStatusEnum.INACTIVE) {
      throw new UnauthorizedException({
        errorCode: ErrorCodeEnum.AUTH_INVALID_STATUS,
        statusCode: 401,
        message: 'Your account has not been activated',
      });
    }

    if (user.status === UserStatusEnum.BANNED) {
      throw new UnauthorizedException({
        errorCode: ErrorCodeEnum.AUTH_INVALID_STATUS,
        statusCode: 401,
        message: 'You has been banned',
      });
    }

    let version = await this.redisService.getAsNumber(
      `user:tokenVersion:${user.id}`,
    );

    if (version === null || version === undefined) {
      version = 0;
    }

    const refreshTtl =
      this.configService.get<number>('JWT_REFRESH_TTL_SECONDS') ??
      60 * 60 * 24 * 7;

    await this.redisService.setWithNumber(
      `user:tokenVersion:${user.id}`,
      version,
      refreshTtl,
    );

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

    return {
      accessToken,
      refreshToken,
      message: 'User logged in successfully',
    };
  }

  async refeshAccessToken(refreshToken: string) {
    let payload: any;

    try {
      payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException({
        errorCode: ErrorCodeEnum.AUTH_INVALID_REFRESH_TOKEN,
        statusCode: 401,
        message: 'Invalid refresh token',
      });
    }

    const userId = payload.sub;

    const redisVersion =
      (await this.redisService.getAsNumber(`user:tokenVersion:${userId}`)) ?? 0;

    if (Number(redisVersion) !== Number(payload.tokenVersion)) {
      throw new UnauthorizedException({
        errorCode: ErrorCodeEnum.AUTH_TOKEN_REVOKED,
        statusCode: 401,
        message: 'Token revoked',
      });
    }

    const newAccessToken = this.jwtService.sign(
      {
        sub: payload.sub,
        role: payload.role,
        tokenVersion: payload.tokenVersion,
      },
      {
        secret: this.configService.get('JWT_SECRET'),
        expiresIn: this.configService.get('JWT_EXPIRES_IN'),
      },
    );

    return { accessToken: newAccessToken };
  }

  async sendForgotPasswordRequest(email: string) {
    const user = await this.usersRepo.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException({
        errorCode: ErrorCodeEnum.USER_NOT_FOUND,
        statusCode: 401,
        message: 'User not found',
      });
    }

    const otp = await this.generateOtp(email);
    const otpExpiresIn =
      this.configService.get<number>('OTP_EXPIRES_IN') ?? 300;
    const otpExpiresInMins = otpExpiresIn / 60;

    await this.mailerService.sendForgotPasswordEmail(email, {
      approver: email,
      otp: otp,
      expiresIn: otpExpiresInMins.toString(),
    });
  }

  async confirmChangePasswordOtp(dto: ForgotPasswordDto) {
    const user = await this.usersRepo.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException({
        errorCode: ErrorCodeEnum.USER_NOT_FOUND,
        statusCode: 401,
        message: 'User not found',
      });
    }

    const isOtpValid = await this.verifyOtp(dto.email, dto.otp);

    if (!isOtpValid) {
      throw new BadRequestException({
        errorCode: ErrorCodeEnum.AUTH_INVALID_OTP,
        statusCode: 400,
        message: 'Invalid Otp',
      });
    }
    return { verified: true };
  }

  async changeForgotPassword(
    verified: boolean,
    email: string,
    dto: NewPasswordDto,
  ) {
    if (!verified) {
      throw new BadRequestException({
        errorCode: ErrorCodeEnum.AUTH_INVALID_OTP,
        statusCode: 400,
        message: 'Invalid Otp',
      });
    }

    const user = await this.usersRepo.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException({
        errorCode: ErrorCodeEnum.USER_NOT_FOUND,
        statusCode: 401,
        message: 'User not found',
      });
    }

    if (dto.password !== dto.confirmPassword) {
      throw new BadRequestException({
        errorCode: ErrorCodeEnum.USER_CONFIRM_PASSWORD_MISMATCH,
        statusCode: 400,
        message: 'Confirm password mismatch',
      });
    }

    const newPasswordHash = await bcrypt.hash(dto.password, 10);
    Object.assign(user, {
      ...user,
      passwordHash: newPasswordHash,
    });

    await this.usersRepo.save(user);
  }

  async confirmRegistration(dto: RegistrationOtpDto) {
    const user = await this.usersRepo.findByEmail(dto.email);

    if (!user) {
      throw new UnauthorizedException({
        errorCode: ErrorCodeEnum.USER_NOT_FOUND,
        statusCode: 401,
        message: 'User not found',
      });
    }

    const isOtpValid = this.verifyOtp(dto.email, dto.otp);

    if (!isOtpValid) {
      throw new BadRequestException({
        errorCode: ErrorCodeEnum.AUTH_INVALID_OTP,
        statusCode: 400,
        message: 'Invalid Otp',
      });
    }

    user.status = UserStatusEnum.ACTIVE;

    await this.usersRepo.save(user);
    return { verified: true };
  }

  private async verifyOtp(email: string, inputOtp: string) {
    const existedOtp = await this.redisService.get(`user:otp:${email}`);
    if (!existedOtp) {
      return false;
    }
    if (existedOtp !== inputOtp) {
      return false;
    }
    await this.redisService.del(`user:otp:${email}`);
    return true;
  }

  private async generateOtp(email: string) {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpTtl = this.configService.get<number>('OTP_EXPIRES_IN') ?? 300;

    await this.redisService.set(`user:otp:${email}`, otp, otpTtl);
    return otp;
  }
}
