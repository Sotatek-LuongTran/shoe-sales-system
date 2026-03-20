import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    return next.handle().pipe(
      map((data) => {
        if (this.isPaginationResponse(data)) {
          return data;
        }
        console.log(data)
        return {
          data,
        };
      }),
    );
  }

  private isPaginationResponse(data: any): boolean {
    return (
      data &&
      typeof data === 'object' &&
      'meta' in data &&
      'data' in data &&
      Array.isArray(data.data)
    );
  }
}
