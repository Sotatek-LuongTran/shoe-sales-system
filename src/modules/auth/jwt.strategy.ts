import { ConfigService } from '@nestjs/config';
import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { RedisService } from '../../common/redis/redis.service';
import { ErrorCodeEnum } from 'src/shared/enums/error-code.enum';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
  ) {
    const secret = configService.get<string>('JWT_SECRET');

    if (!secret) {
      throw new NotFoundException({
        errorCode: ErrorCodeEnum.AUTH_JWT_SECRET_NOT_FOUND,
        statusCode: 404,
      });
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: any) {
    let currentVersion = await this.redisService.getAsNumber(
      `user:tokenVersion:${payload.sub}`,
    );
    if (currentVersion === null) {
      currentVersion = 0;
    }

    if (payload.tokenVersion === undefined) {
      throw new UnauthorizedException({
        errorCode: ErrorCodeEnum.AUTH_INVALID_TOKEN_STRUCTURE,
        statusCode: 401,
      });
    }

    if (Number(currentVersion) !== Number(payload.tokenVersion)) {
      throw new UnauthorizedException({
        errorCode: ErrorCodeEnum.AUTH_UNAUTHORIZED,
        statusCode: 401,
      });
    }

    return {
      userId: payload.sub,
      role: payload.role,
    };
  }
}
