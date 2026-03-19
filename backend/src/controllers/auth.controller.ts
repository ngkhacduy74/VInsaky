import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthAbstract } from 'src/abstracts/services/auth.abstract';

import { LoginDto, LoginResponse } from 'src/dtos/request/auth/login.dto';
import { RegisterDto, RegisterResponse } from 'src/dtos/request/auth/register.dto';
import { RefreshTokenDto } from 'src/dtos/request/auth/refresh-token.dto';
import { ApiTags } from '@nestjs/swagger';
import { ApiDescription } from 'src/decorators/http.decorators';
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthAbstract) {}

  @Post('login')
  @ApiDescription({ summary: 'Đăng nhập người dùng' ,type: LoginResponse})
  @HttpCode(HttpStatus.OK)
  async login(@Body() data: LoginDto) {
    return await this.authService.login(data);
  }
  @Post('register')
  @ApiDescription({ summary: 'Đăng ký người dùng' ,type: RegisterResponse})
  @HttpCode(HttpStatus.OK)
  async register(@Body() data: RegisterDto) {
    return await this.authService.register(data);
  }

  @Post('refresh-token')
  @ApiDescription({ summary: 'Refresh token' ,type: LoginResponse})
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Body() data: RefreshTokenDto) {
    return await this.authService.refreshToken(data);
  }
}
