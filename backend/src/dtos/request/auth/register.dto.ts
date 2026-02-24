import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MinLength,
  MaxLength,
  IsIn,
} from 'class-validator';
import { User } from 'src/schemas/user.schema';
import { PublicUserDto } from 'src/dtos/response/user.dto';

export class RegisterDto {
  @IsString({ message: 'Họ tên phải là chuỗi' })
  @IsNotEmpty({ message: 'Họ tên không được để trống' })
  @MinLength(2, { message: 'Họ tên phải có ít nhất 2 ký tự' })
  @MaxLength(100, { message: 'Họ tên tối đa 100 ký tự' })
  fullname: string;

  @IsString({ message: 'Số điện thoại phải là chuỗi' })
  @IsNotEmpty({ message: 'Số điện thoại không được để trống' })
  @Matches(/^[0-9]{9,11}$/, {
    message: 'Số điện thoại không hợp lệ',
  })
  phone: string;

  @IsEmail({}, { message: 'Email không đúng định dạng' })
  @IsNotEmpty({ message: 'Email không được để trống' })
  email: string;

  @IsOptional()
  @IsString({ message: 'Địa chỉ phải là chuỗi' })
  address?: string;

  @IsString({ message: 'Mật khẩu phải là chuỗi' })
  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
  @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' })
  @MaxLength(50, { message: 'Mật khẩu tối đa 50 ký tự' })
  password: string;

  @IsString({ message: 'Giới tính phải là chuỗi' })
  @IsNotEmpty({ message: 'Giới tính không được để trống' })
  @IsIn(['Male', 'Female', 'Other'], {
    message: 'Giới tính không hợp lệ',
  })
  gender: string;

  @IsOptional()
  @IsString({ message: 'Avatar phải là chuỗi URL' })
  ava_img_url?: string;

  @IsBoolean({ message: 'License phải là true hoặc false' })
  @IsOptional()
  license?: boolean;
}

export type RegisterResponse = {
  user: PublicUserDto;
};
