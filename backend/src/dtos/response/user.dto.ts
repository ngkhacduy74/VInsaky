import { Expose, Transform, Type } from 'class-transformer';

export class PublicUserDto {
  @Expose()
  @Transform(({ obj }) => obj._id?.toString() || obj.id)
  id: string;

  @Expose()
  fullname: string;

  @Expose()
  email: string;

  @Expose()
  role: string;

  @Expose()
  ava_img_url?: string;

  @Expose()
  phone?: string;

  @Expose()
  is_active?: boolean;
}

export class DeleteUserDto {
  @Expose()
  deleted: boolean;

  @Expose()
  @Type(() => PublicUserDto)
  user: PublicUserDto;
}

export class UpdateUserResponseDto {
  @Expose()
  fullname?: string;

  @Expose()
  phone?: string;

  @Expose()
  address?: string;

  @Expose()
  gender?: string;

  @Expose()
  ava_img_url?: string;
}
