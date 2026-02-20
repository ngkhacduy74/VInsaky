import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  MaxLength,
} from 'class-validator';
import { User } from 'src/schemas/user.schema';

export class LoginDto {
  @IsEmail({}, { message: 'Email không đúng định dạng' })
  @IsNotEmpty({ message: 'Email không được để trống' })
  email: string;

  @IsString({ message: 'Mật khẩu phải là chuỗi' })
  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
  @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' })
  @MaxLength(50, { message: 'Mật khẩu tối đa 50 ký tự' })
  password: string;
}

export type PublicUser = Pick<
  User,
  'id' | 'fullname' | 'email' | 'role' | 'ava_img_url'
>;

export type LoginResponse = {
  accessToken: string;
  refreshToken: string;
  user: PublicUser;
};
