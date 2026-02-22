import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type BannerProductDocument = HydratedDocument<BannerProduct>;
export type BannerProductIdsDocument = HydratedDocument<BannerProductIds>;

@Schema({ timestamps: true, versionKey: false })
export class BannerProduct {
  @Prop({ type: String, required: true })
  id: string;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, default: 'Sản phẩm' })
  category: string;

  @Prop({ type: String, required: true })
  description: string;

  @Prop({ type: String, required: true })
  price: string;

  @Prop({ type: String, default: 'Giảm 15%' })
  discount: string;

  @Prop({ type: String, required: true })
  image: string;

  @Prop({ type: String, required: true })
  badge: string;

  @Prop({ type: String, default: 'Mua Ngay' })
  buttonText: string;

  @Prop({ type: Boolean, default: true })
  isActive: boolean;

  @Prop({ type: Number, default: 0 })
  order: number;
}

export const BannerProductSchema = SchemaFactory.createForClass(BannerProduct);

@Schema({ timestamps: true, versionKey: false })
export class BannerProductIds {
  @Prop({ type: [String], default: [] })
  productIds: string[];

  @Prop({ type: Boolean, default: true })
  isActive: boolean;

  @Prop({ type: Number, default: 10 })
  maxProducts: number;
}

export const BannerProductIdsSchema =
  SchemaFactory.createForClass(BannerProductIds);
