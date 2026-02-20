import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { Response, Request } from 'express';

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const http = context.switchToHttp();
    const res = http.getResponse<Response>();
    const req = http.getRequest<Request>();

    return next.handle().pipe(
      map((payload: any) => {
        if (payload && typeof payload === 'object' && 'success' in payload) {
          return payload;
        }

        const message =
          typeof payload?.message === 'string' && payload.message.trim()
            ? payload.message
            : 'Success';

        const data = Object.prototype.hasOwnProperty.call(payload ?? {}, 'data')
          ? payload.data
          : payload;

        return {
          success: true,
          statusCode: res.statusCode,
          message,
          data,
          path: req.url,
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }
}
