import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { User, UserSchema } from './user.schema';
import { v4 as uuidv4 } from 'uuid';
export type PostDocument = HydratedDocument<Post>;

export enum PostStatus {
  New = 'New',
  SecondHand = 'SecondHand',
}

export enum UserPosition {
  Newbie = 'Newbie',
  Professional = 'Professional',
}

export enum PostCondition {
  Pending = 'Pending',
  Active = 'Active',
  Inactive = 'Inactive',
  Reject = 'Reject',
}

@Schema({ _id: false })
export class Comment {
  @Prop({ type: String, required: true })
  user_id: string;

  @Prop({ type: String, required: true })
  content: string;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;
}
export const CommentSchema = SchemaFactory.createForClass(Comment);

@Schema({ timestamps: true, versionKey: false })
export class Post {
  @Prop({
    required: true,
    unique: true,
    index: true,
    default: uuidv4,
  })
  id: string;

  @Prop({ type: String, required: true })
  category: string;

  @Prop({ type: [String], required: true })
  image: string[];

  @Prop({ type: [String], required: true })
  video: string[];

  @Prop({
    type: String,
    required: true,
    enum: Object.values(PostStatus),
  })
  status: PostStatus;

  @Prop({ type: String, required: true })
  title: string;

  @Prop({
    type: String,
    required: true,
    enum: Object.values(UserPosition),
  })
  user_position: UserPosition;

  @Prop({ type: String, required: true })
  address: string;

  @Prop({ type: String, required: true })
  description: string;

  @Prop({ type: String, required: false })
  content?: string;

  @Prop({ type: UserSchema, required: true })
  seller: User;

  @Prop({
    type: String,
    enum: Object.values(PostCondition),
    default: PostCondition.Pending,
  })
  condition: PostCondition;

  @Prop({ type: [CommentSchema], default: [] })
  comments: Comment[];

  @Prop({ type: [String], default: [] })
  likes: string[]; // userId

  @Prop({ type: [String], default: [] })
  favorites: string[]; // userId
}

export const PostSchema = SchemaFactory.createForClass(Post);
