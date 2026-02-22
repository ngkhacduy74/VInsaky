import { Type } from 'class-transformer';
import { IsIn, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import {
  PostCondition,
  PostStatus,
  UserPosition,
} from 'src/schemas/post.schema';

export class GetAllPostQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  skip?: number = 0;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 20;

  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsIn(Object.values(PostStatus))
  status?: PostStatus;

  @IsOptional()
  @IsIn(Object.values(UserPosition))
  user_position?: UserPosition;

  @IsOptional()
  @IsIn(Object.values(PostCondition))
  condition?: PostCondition;

  @IsOptional()
  @IsIn(['createdAt', 'title'])
  sortBy?: 'createdAt' | 'title' = 'createdAt';

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';
}
