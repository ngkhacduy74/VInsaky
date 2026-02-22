import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from 'src/dtos/request/auth/login.dto';
import { v4 as uuidv4, v4 } from 'uuid';
import { LoginResponse, PublicUser } from 'src/dtos/request/auth/login.dto';
import { AuthAbstract } from 'src/abstracts/auth.abstract';
import { BaseResponseDto } from 'src/common/dto/base-response.dto';
import { UserRepository } from 'src/repositories/user.repositories';
import { RefreshTokenDto } from 'src/dtos/request/auth/refresh-token.dto';
import {
  RegisterDto,
  RegisterResponse,
} from 'src/dtos/request/auth/register.dto';
import { User } from 'src/schemas/user.schema';

@Injectable()
export class AuthService implements AuthAbstract {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
  ) {}

  async login(data: LoginDto): Promise<BaseResponseDto<LoginResponse>> {
    const user = await this.userRepository.findUserByEmail(data.email);

    if (!user) {
      throw new NotFoundException('Tài khoản không tồn tại');
    }
    if ((user as any).is_deleted === true) {
      throw new UnauthorizedException('Tài khoản đã bị xóa');
    }

    if (user.is_active === false) {
      throw new UnauthorizedException('Tài khoản đã bị khóa');
    }

    const isMatch = await bcrypt.compare(data.password, user.password);

    if (!isMatch) {
      throw new UnauthorizedException('Mật khẩu không chính xác');
    }

    const accessToken = this.jwtService.sign(
      {
        user: {
          id: user.id,
          role: user.role,
          fullname: user.fullname,
          email: user.email,
          phone: user.phone,
          address: user.address,
          gender: user.gender,
          ava_img_url: user.ava_img_url,
        },
      },
      { expiresIn: '30m' },
    );
    const refreshToken = this.jwtService.sign(
      {
        user: {
          id: user.id,
          role: user.role,
          fullname: user.fullname,
          email: user.email,
          phone: user.phone,
          address: user.address,
          gender: user.gender,
          ava_img_url: user.ava_img_url,
        },
        type: 'refresh',
      },
      {
        secret: process.env.REFRESH_TOKEN,
        expiresIn: '30d',
      },
    );
    const publicUser: PublicUser = {
      id: user.id,
      fullname: user.fullname,
      email: user.email,
      role: user.role,
      ava_img_url: user.ava_img_url,
      phone: user.phone,
      address: user.address,
    };

    return {
      success: true,
      data: {
        accessToken,
        refreshToken,
        user: publicUser,
      },
    };
  }
  async register(
    data: RegisterDto,
  ): Promise<BaseResponseDto<RegisterResponse>> {
    const exist = await this.userRepository.findUserByEmail(data.email);
    if (exist) {
      throw new ConflictException({
        message: 'Email đã được đăng ký',
        errors: { email: 'EMAIL_EXISTS' },
      });
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    try {
      const created = await this.userRepository.createUser({
        id: uuidv4(),
        fullname: data.fullname,
        phone: data.phone,
        address: data.address ?? '',
        email: data.email,
        gender: data.gender,
        password: hashedPassword,
        role: 'User',
        ava_img_url: data.ava_img_url ?? '',
        is_active: true,
        license: true,
      });

      const publicUser = {
        id: created.id,
        fullname: created.fullname,
        email: created.email,
        role: created.role,
        ava_img_url: created.ava_img_url,
      };

      return {
        success: true,
        data: {
          user: publicUser,
        },
      };
    } catch (err: any) {
      if (err?.code === 11000) {
        throw new ConflictException({
          message: 'Email đã được đăng ký',
          errors: { email: 'EMAIL_EXISTS' },
        });
      }
      throw new InternalServerErrorException({
        message: 'Đăng ký thất bại',
        errors: err?.message,
      });
    }
  }

  async refreshToken(
    data: RefreshTokenDto,
  ): Promise<BaseResponseDto<LoginResponse>> {
    try {
      const payload = this.jwtService.verify(data.refreshToken, {
        secret: process.env.REFRESH_TOKEN,
      });

      if (payload?.type !== 'refresh' || !payload?.user?.email) {
        throw new UnauthorizedException('Token không hợp lệ');
      }

      const user = await this.userRepository.findUserByEmail(
        payload.user.email,
      );

      if (!user) {
        throw new UnauthorizedException('Tài khoản không tồn tại');
      }
      if ((user as any).is_deleted === true) {
        throw new UnauthorizedException('Tài khoản đã bị xóa');
      }
      if (user.is_active === false) {
        throw new UnauthorizedException('Tài khoản đã bị khóa');
      }

      const accessToken = this.jwtService.sign(
        {
          user: {
            id: user.id,
            role: user.role,
            fullname: user.fullname,
            email: user.email,
            phone: user.phone,
            address: user.address,
            gender: user.gender,
            ava_img_url: user.ava_img_url,
          },
        },
        { expiresIn: '30m' },
      );
      
      const newRefreshToken = this.jwtService.sign(
        {
          user: {
            id: user.id,
            role: user.role,
            fullname: user.fullname,
            email: user.email,
            phone: user.phone,
            address: user.address,
            gender: user.gender,
            ava_img_url: user.ava_img_url,
          },
          type: 'refresh',
        },
        {
          secret: process.env.REFRESH_TOKEN,
          expiresIn: '30d',
        },
      );

      const publicUser: PublicUser = {
        id: user.id,
        fullname: user.fullname,
        email: user.email,
        role: user.role,
        ava_img_url: user.ava_img_url,
        phone: user.phone,
        address: user.address,
      };

      return {
        success: true,
        data: {
          accessToken,
          refreshToken: newRefreshToken,
          user: publicUser,
        },
      };
    } catch (e: any) {
      if (e instanceof UnauthorizedException) {
        throw e;
      }
      throw new UnauthorizedException(
        'Refresh token đã hết hạn hoặc không hợp lệ',
      );
    }
  }
}
