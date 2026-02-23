import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
export type ProductDocument = HydratedDocument<Product>;

export enum ProductStatus {
  New = 'New',
  SecondHand = 'SecondHand',
}

@Schema({ _id: false })
export class OtherFeatures {
  @Prop({ type: String, required: true })
  id: string;

  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: String, required: true })
  description: string;
}
export const OtherFeaturesSchema = SchemaFactory.createForClass(OtherFeatures);

@Schema({ _id: false })
export class CreatorInfo {
  @Prop({ type: String, required: true })
  id: string;

  @Prop({ type: String, required: true })
  fullname: string;

  @Prop({ type: String, required: true })
  phone: string;

  @Prop({ type: String, required: true })
  email: string;
}
export const CreatorInfoSchema = SchemaFactory.createForClass(CreatorInfo);

@Schema({ timestamps: true, versionKey: false })
export class Product {
  @Prop({
    required: true,
    unique: true,
    index: true,
    default: uuidv4,
  })
  id: string;

  @Prop({ type: [String], required: true })
  image: string[];

  @Prop({ type: [String], required: true })
  video: string[];

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: true })
  brand: string;

  @Prop({ type: String, required: true })
  category: string;

  @Prop({ type: Number, required: true })
  price: number;

  @Prop({ type: String, required: true })
  description: string;

  @Prop({ type: String, required: false })
  size?: string;

  @Prop({ type: Number, required: false })
  weight?: number;

  @Prop({ type: String, required: true, enum: Object.values(ProductStatus) })
  status: ProductStatus;

  @Prop({ type: Number, required: true })
  warranty_period: number;

  @Prop({ type: String, required: true })
  business_phone: string;

  @Prop({ type: String, required: false })
  voltage?: string;

  @Prop({ type: [OtherFeaturesSchema], required: false, default: [] })
  features?: OtherFeatures[];

  @Prop({ type: Number, required: true, min: 0 })
  quantity: number;

  @Prop({ type: CreatorInfoSchema, required: true })
  creator: CreatorInfo;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
