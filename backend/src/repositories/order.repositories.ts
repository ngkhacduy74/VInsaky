import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model } from 'mongoose';
import { Order, OrderDocument } from 'src/schemas/order.schema';
import { CreateOrderDto, CreateOrderItemDto } from 'src/dtos/request/order/create-order.dto';


@Injectable()
export class OrderRepository {
  constructor(@InjectModel(Order.name) private readonly model: Model<OrderDocument>) {}

  async startTransactionSession(): Promise<ClientSession> {
    return await this.model.db.startSession();
  }

 createOrder(
  userId: string | undefined,
  dto: CreateOrderDto,
  invoice: string,
  total_prices: number,
  session?: ClientSession,
) {
  return this.model.create(
    [
      {
        user_id: userId || 'GUEST',
        shipping: dto.shipping,
        items: dto.items,
        total: total_prices, // tốt hơn: truyền total_prices đã tính từ DB
        status: 'pending',
        sepay: { orderInvoiceNumber: invoice, status: 'pending' },
      },
    ],
    session ? { session } : undefined,
  );
}
  findByInvoice(invoice: string) {
    return this.model.findOne({ 'sepay.orderInvoiceNumber': invoice });
  }

  async markPaid(invoice: string, transactionId?: string, raw?: any) {
    await this.model.updateOne(
      { 'sepay.orderInvoiceNumber': invoice },
      {
        $set: {
          status: 'paid',
          'sepay.status': 'paid',
          'sepay.transactionId': transactionId,
          'sepay.paidAt': new Date(),
          'sepay.ipnRaw': raw,
        },
      },
    );
  }
   async checkTotal(items: CreateOrderItemDto[]) {
    return items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  }
  async markEmailSent(invoice: string, session?: ClientSession) {
  return this.model.updateOne(
    { 'sepay.orderInvoiceNumber': invoice, emailSentAt: { $exists: false } },
    { $set: { emailSentAt: new Date() } },
    session ? { session } : undefined,
  );
}
}