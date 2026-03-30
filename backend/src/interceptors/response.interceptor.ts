import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Response, Request } from 'express';

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const http = context.switchToHttp();
    const req = http.getRequest<Request>();
    const res = http.getResponse<Response>();

    // QUAN TRỌNG: Nếu URL chứa "metrics", trả về dữ liệu thô ngay lập tức
    // dùng toLowerCase để tránh sai sót viết hoa viết thường
    if (req.url.toLowerCase().includes('metrics')) {
      return next.handle();
    }

    return next.handle().pipe(
      map((payload: any) => {
        // Nếu payload đã có cấu trúc chuẩn của hệ thống thì trả về luôn
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
