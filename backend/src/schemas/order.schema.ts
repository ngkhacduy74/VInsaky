import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type OrderDocument = HydratedDocument<Order>;

export enum OrderStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

@Schema({ _id: false })
class ShippingInfo {
  @Prop({ required: true, trim: true })
  fullName: string;

  @Prop({ required: true, trim: true })
  phone: string;

  @Prop({ required: true, trim: true })
  addressDetail: string;

  @Prop({ trim: true })
  note?: string;
}
const ShippingInfoSchema = SchemaFactory.createForClass(ShippingInfo);

@Schema({ _id: false })
class OrderItem {
  @Prop({ type: String, required: true })
  product_id: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, min: 0 })
  price: number;

  @Prop({ required: true, min: 1 })
  quantity: number;
}
const OrderItemSchema = SchemaFactory.createForClass(OrderItem);

@Schema({ _id: false })
class SepayInfo {
  @Prop({ required: true })
  orderInvoiceNumber: string;

  @Prop({ default: 'pending' })
  status: 'pending' | 'paid' | 'failed';

  @Prop()
  transactionId?: string;

  @Prop()
  paidAt?: Date;

  @Prop({ type: Object })
  ipnRaw?: Record<string, any>;
}
const SepayInfoSchema = SchemaFactory.createForClass(SepayInfo);

@Schema({ timestamps: true })
export class Order {
  @Prop({ type: String, required: true })
  user_id: string;

  @Prop({ type: ShippingInfoSchema, required: true })
  shipping: ShippingInfo;

  @Prop({ type: [OrderItemSchema], required: true })
  items: OrderItem[];

  @Prop({ required: true, min: 0 })
  total: number;

  @Prop({
    type: String,
    enum: OrderStatus,
    default: OrderStatus.PENDING,
    index: true,
  })
  status: OrderStatus;

  @Prop({ type: SepayInfoSchema, required: true })
  sepay: SepayInfo;

  // timestamps (mongoose tự tạo vì timestamps:true)
  @Prop()
  createdAt?: Date;

  @Prop()
  updatedAt?: Date;
}

export const OrderSchema = SchemaFactory.createForClass(Order);

OrderSchema.index({ 'sepay.orderInvoiceNumber': 1 }, { unique: true });