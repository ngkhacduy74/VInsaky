import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true, versionKey: false })
export class User {
  @Prop({
    required: true,
    unique: true,
    index: true,
    default: uuidv4,
  })
  id: string;

  @Prop({ type: String, required: true })
  fullname: string;

  @Prop({ type: String, required: true })
  phone: string;

  @Prop({ type: String, required: true })
  email: string;

  @Prop({ type: String, required: false })
  address?: string;

  @Prop({ type: String, required: true })
  password: string;

  @Prop({ type: String, required: true })
  gender: string;

  @Prop({ type: String, required: true })
  role: string;

  @Prop({ type: String, required: false })
  ava_img_url?: string;

  // @Prop({ type: String, required: false })
  // currentToken?: string;

  @Prop({ type: Boolean, required: false })
  is_active?: boolean;

  @Prop({ type: Boolean, required: false })
  license?: boolean;
   @Prop({ type: Boolean, default: false })
  isPremium: boolean;
  @Prop({ type: Number, default: 0 })
  postCount: number;

  @Prop({ type: Date, default: Date.now })
  lastLoginAt: Date;

  @Prop({ type: Date, default: Date.now })
  lastActivityAt: Date;

  @Prop({ default: false })
  is_deleted: boolean;

  @Prop({ default: null })
  deleted_at?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
