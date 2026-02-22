import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type OtpDocument = HydratedDocument<Otp>;

@Schema({
  versionKey: false,
  timestamps: false,
})
export class Otp {
  @Prop({ type: String, required: true, index: true })
  email: string;

  @Prop({ type: String, required: true })
  otp: string;

  
  @Prop({
    type: Date,
    required: true,
    index: { expires: 0 }, 
  })
  expiresAt: Date;
}

export const OtpSchema = SchemaFactory.createForClass(Otp);
