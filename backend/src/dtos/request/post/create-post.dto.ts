import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  ArrayMinSize,
} from 'class-validator';
import { PostStatus, UserPosition } from 'src/schemas/post.schema';

export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  category: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  image: string[];

  @IsArray()
  @IsString({ each: true })
  video: string[];

  @IsEnum(PostStatus)
  status: PostStatus;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsEnum(UserPosition)
  user_position: UserPosition;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsOptional()
  @IsString()
  content?: string;
}
