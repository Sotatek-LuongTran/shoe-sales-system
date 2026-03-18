import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { map, Observable } from 'rxjs';
import { StorageService } from '../modules/common-storage/storage.service';

@Injectable()
export class ImageKeyInterceptor implements NestInterceptor {
  constructor(
    private reflector: Reflector,
    private storageService: StorageService,
  ) {}
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.id;
    return next.handle().pipe(map(async (data) => this.processData(data, userId)));
  }

  private async processData(data: any, userId: string): Promise<any> {
    if (!data) return data;

    if (Array.isArray(data)) {
      return Promise.all(data.map((item) => this.processObject(item, userId)));
    }

    return this.processObject(data, userId);
  }

  private async processObject(obj: any, userId: string): Promise<any> {
    if (!obj || typeof obj !== 'object') return obj;
    if (obj instanceof Date) {
      return obj;
    }

    const result = { ...obj };

    for (const key of Object.keys(result)) {
      const value = result[key];

      if (Array.isArray(value)) {
        result[key] = await Promise.all(
          value.map((v) => this.processObject(v, userId)),
        );
        continue;
      }

      if (typeof value === 'object') {
        result[key] = await this.processObject(value, userId);
        continue;
      }

      if (key.endsWith('Key') && value) {
        const url = await this.storageService.createDownloadUrl(userId, value);
        result[key.replace('Key', 'Url')] = url;
      }
    }
    return result;
  }
}
