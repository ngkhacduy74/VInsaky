import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthAbstract } from 'src/abstracts/auth.abstract';

import { LoginDto } from 'src/dtos/request/auth/login.dto';
import { RegisterDto } from 'src/dtos/request/auth/register.dto';
import { JwtAuthGuard } from 'src/guard/permission.guard';
import { AuthService } from 'src/services/auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthAbstract) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() data: LoginDto) {
    return await this.authService.login(data);
  }
  @Post('register')
  @HttpCode(HttpStatus.OK)
  async register(@Body() data: RegisterDto) {
    return await this.authService.register(data);
  }
}
