import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TokenExpiredError } from 'jsonwebtoken';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // Hỗ trợ cả 2 cách: Authorization Bearer (chuẩn) và header token cũ
    let token: string | undefined;
    const authHeader = request.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else if (request.headers['token']) {
      token = request.headers['token'];
    }

    if (!token) {
      throw new ForbiddenException(
        'Bạn đang thiếu token để thực hiện chức năng này',
      );
    }

    try {
      const decoded_token = await this.jwtService.verify(token);
      // JWT payload: { user: { id, role, fullname }, exp, iat } — gán user thật để RoleGuard đọc được role
      request.user = decoded_token.user ?? decoded_token;
      return true;
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw new UnauthorizedException(
          'Token đã hết hạn, vui lòng đăng nhập lại',
        );
      }

      if (error.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Token không hợp lệ');
      }

      console.error('Lỗi xác thực token:', error.message);
      throw new UnauthorizedException('Xác thực token thất bại');
    }
  }
}
