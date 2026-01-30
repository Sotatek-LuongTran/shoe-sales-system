// src/auth/guards/roles.guard.ts

import {
    Injectable,
    CanActivate,
    ExecutionContext,
    ForbiddenException,
  } from '@nestjs/common';
  import { Reflector } from '@nestjs/core';
  import { UserRole } from 'src/database/entities/user.entity';
import { ROLES_KEY } from '../decorator/role.decorator';
  
  @Injectable()
  export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) { }
  
    canActivate(context: ExecutionContext): boolean {
      const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);
  
      if (!requiredRoles) return true;
  
      const { user } = context.switchToHttp().getRequest();
  
      if (!requiredRoles.includes(user.role)) {
        throw new ForbiddenException('Forbidden resource');
      }
  
      return true;
    }
  }
  