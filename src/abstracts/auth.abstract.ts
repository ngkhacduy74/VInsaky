import { BaseResponseDto } from 'src/common/dto/base-response.dto';
import { LoginDto, LoginResponse } from 'src/dtos/request/auth/login.dto';
import {
  RegisterDto,
  RegisterResponse,
} from 'src/dtos/request/auth/register.dto';

export abstract class AuthAbstract {
  abstract login(data: LoginDto): Promise<BaseResponseDto<LoginResponse>>;
  abstract register(
    data: RegisterDto,
  ): Promise<BaseResponseDto<RegisterResponse>>;
}
