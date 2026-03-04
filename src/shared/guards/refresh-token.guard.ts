import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { Request } from 'express';
import { ErrorCodeEnum } from '../enums/error-code.enum';

@Injectable()
export class RefreshTokenGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const authHeader = req.headers['authorization'];

    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException({
        errorCode: ErrorCodeEnum.AUTH_INVALID_REFRESH_TOKEN,
        statusCode: 401,
        message: 'Invalid refresh token'
      });
    }
    const refreshToken = authHeader.slice(7);
    if (!refreshToken) {
        throw new UnauthorizedException({
            errorCode: ErrorCodeEnum.AUTH_REFRESH_TOKEN_NOT_FOUND,
            statusCode: 401,
            message: 'Refresh token not found'
          });
    }
    req['refreshToken'] = refreshToken;
    return true;
  }
}
