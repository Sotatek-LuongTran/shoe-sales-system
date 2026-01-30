import { ConfigService } from "@nestjs/config";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { RedisService } from "../redis/redis.service";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private readonly configService: ConfigService,
        private readonly redisService: RedisService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('JWT_SECRET') ?? '',
            passReqToCallback: true,
        });
    }

    async validate(req: Request, payload: any) {
        const sessionKey = payload?.sessionKey as string | undefined;
        const exp = typeof payload?.exp === 'number' ? payload.exp : undefined;

        if (sessionKey) {
            const isBlacklisted = await this.redisService.get(
              `blacklist:session:${sessionKey}`,
            );
            if (isBlacklisted) {
                throw new UnauthorizedException('Session has been revoked');
            }
        }

        return { userId: payload.sub, role: payload.role, sessionKey, exp };
    }
}