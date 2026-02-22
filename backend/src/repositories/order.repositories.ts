import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument } from 'src/schemas/order.schema';
import { CreateOrderDto } from 'src/dtos/request/order/create-order.dto';


@Injectable()
export class OrderRepository {
  constructor(@InjectModel(Order.name) private readonly model: Model<OrderDocument>) {}

  createOrder(userId: string | undefined, dto: CreateOrderDto, invoice: string) {
    return this.model.create({
      user_id: userId || 'GUEST',
      shipping: dto.shipping,
      items: dto.items,
      total: dto.total,
      status: 'pending',
      sepay: { orderInvoiceNumber: invoice, status: 'pending' },
    });
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
}