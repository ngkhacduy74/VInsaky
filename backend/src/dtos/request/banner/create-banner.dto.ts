import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateBannerDto {
  @IsNotEmpty({ message: 'ID không được để trống' })
  @IsString()
  id: string;

  @IsNotEmpty({ message: 'Tên banner không được để trống' })
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsNotEmpty({ message: 'Mô tả không được để trống' })
  @IsString()
  description: string;

  @IsNotEmpty({ message: 'Giá không được để trống' })
  @IsString()
  price: string;

  @IsOptional()
  @IsString()
  discount?: string;

  @IsNotEmpty({ message: 'Ảnh không được để trống' })
  @IsString()
  image: string;

  @IsNotEmpty({ message: 'Badge không được để trống' })
  @IsString()
  badge: string;

  @IsOptional()
  @IsString()
  buttonText?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsNumber()
  order?: number;
}
