import { IsEmail, IsOptional, IsString, Matches } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  fullname?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[0-9]{9,11}$/, { message: 'Số điện thoại không hợp lệ' })
  phone?: string;

  //   @IsOptional()
  //   @IsEmail({}, { message: 'Email không đúng định dạng' })
  //   email?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  gender?: string;

  @IsOptional()
  @IsString()
  ava_img_url?: string;
}
