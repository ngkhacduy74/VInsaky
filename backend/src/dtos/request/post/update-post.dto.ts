import { IsArray, IsEnum, IsOptional, IsString } from 'class-validator';
import { PostStatus, UserPosition } from 'src/schemas/post.schema';

export class UpdatePostDto {
  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  image?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  video?: string[];

  @IsOptional()
  @IsEnum(PostStatus)
  status?: PostStatus;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsEnum(UserPosition)
  user_position?: UserPosition;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  content?: string;
}
