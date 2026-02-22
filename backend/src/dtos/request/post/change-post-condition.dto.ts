import { IsEnum } from 'class-validator';
import { PostCondition } from 'src/schemas/post.schema';

export class ChangePostConditionDto {
  @IsEnum(PostCondition)
  condition: PostCondition;
}
