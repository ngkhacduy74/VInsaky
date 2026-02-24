import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BaseResponseDto } from 'src/common/dto/base-response.dto';
import { OrderAbstract } from 'src/abstracts/order.abstract';
import { CreateOrderDto } from 'src/dtos/request/order/create-order.dto';
import { OrderResponseDto } from 'src/dtos/response/order.dto';
import { SepayCheckoutResponseDto } from 'src/dtos/response/sepay-checkout-response.dto';
import { OrderRepository } from 'src/repositories/order.repositories';
import { sepaySignature } from 'src/common/shared/function/sepay-sign';
import { ProductRepository } from 'src/repositories/product.repositories';
import { MailService } from './mail.service';
import { MailType } from 'src/schemas/mail.schema';
import { orderPaidEmailHtml } from 'src/common/shared/function/order-email-template';

import { UserRepository } from 'src/repositories/user.repositories';

@Injectable()
export class OrderService implements OrderAbstract {
  constructor(
    private readonly repo: OrderRepository,
    private readonly productRepo: ProductRepository,
    private readonly mailService: MailService,
    private readonly config: ConfigService,
    private readonly userRepo: UserRepository,
  ) {}

  private createInvoice(): string {
    return `INV-${Date.now()}`;
  }

  private getEnvOrThrow(key: string): string {
    const v = this.config.get<string>(key);
    if (!v) throw new Error(`Missing ${key}`);
    return v;
  }

  async checkoutSepay(
    userId: string,
    payload: CreateOrderDto,
  ): Promise<BaseResponseDto<SepayCheckoutResponseDto>> {
    
    if (!payload?.items || payload.items.length === 0) {
      throw new BadRequestException('Thiếu thông tin sản phẩm');
    }
    if (!payload?.shipping?.email) {
  throw new BadRequestException('Thiếu email');
}
     if (!payload?.shipping?.fullName || !payload?.shipping?.phone || !payload?.shipping?.addressDetail) {
      throw new BadRequestException('Thiếu thông tin giao hàng');
    }
    const total_prices = await this.repo.checkTotal(payload.items);
    if (!Number.isFinite(total_prices) || total_prices <= 0) {
  throw new BadRequestException('Không lấy được giá tiền sản phẩm');
}
   
   

    const invoice = this.createInvoice();
    const reserveResult = await this.productRepo.checkAndReserveStock(payload.items);
    if (!reserveResult.ok) {
      throw new BadRequestException(`Sản phẩm "${reserveResult.failedItemName}" không đủ số lượng trong kho`);
    }
    await this.repo.createOrder(userId, payload, invoice, total_prices);

        
    const merchant = this.getEnvOrThrow('SEPAY_MERCHANT');
    const secretKey = this.getEnvOrThrow('SEPAY_SECRET_KEY');
    const baseUrl = this.getEnvOrThrow('SEPAY_BASE_URL');
    const successUrl = this.getEnvOrThrow('SEPAY_SUCCESS_URL');
    const errorUrl = this.getEnvOrThrow('SEPAY_ERROR_URL');
    const cancelUrl = this.getEnvOrThrow('SEPAY_CANCEL_URL');



    const fields: Record<string, any> = {
  merchant,
  operation: 'PURCHASE',
  payment_method: 'BANK_TRANSFER',          
  order_amount: String(Math.round(total_prices)), 
  currency: 'VND',
  order_invoice_number: invoice,
  order_description: `Thanh toan don hang ${invoice}`,
  customer_id: userId ?? 'GUEST',
  success_url: `${successUrl}?orderCode=${invoice}`,
  error_url: `${errorUrl}?orderCode=${invoice}`,
  cancel_url: `${cancelUrl}?orderCode=${invoice}`,
};

    const signature = sepaySignature(secretKey, fields);
    const checkoutUrl = `${baseUrl}/v1/checkout/init`;

    const html = `
<form id="sepay" action="${checkoutUrl}" method="POST">
  ${Object.entries({ ...fields, signature })
    .map(([k, v]) => {
      const safeValue = String(v ?? '').replace(/"/g, '&quot;');
      return `<input type="hidden" name="${k}" value="${safeValue}" />`;
    })
    .join('\n')}
</form>
<script>document.getElementById('sepay').submit();</script>
`.trim();

    return {
      success: true,
      data: { invoice, html },
    };
  }

  async handleSepayIpn(
    headers: Record<string, any>,
    body: any,
  ): Promise<BaseResponseDto<null>> {
    const expected = this.getEnvOrThrow('SEPAY_IPN_SECRET_KEY');
    const incoming =
      headers['x-secret-key'] ||
      headers['X-Secret-Key'] ||
      headers['x-secret-key'.toLowerCase()];

    if (!incoming || incoming !== expected) {
      throw new UnauthorizedException('Invalid IPN secret');
    }

    const type = body?.notification_type;
    const invoice = body?.order?.order_invoice_number;
    const amount = Number(body?.order?.order_amount);

    if (!type || !invoice) {
      throw new BadRequestException('Missing notification_type/invoice');
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new BadRequestException('Invalid order_amount');
    }

    if (invoice.startsWith('INV-VIP-')) {
      if (type === 'ORDER_PAID' && amount >= 25000) {
        const payloadStr = invoice.split('INV-VIP-')[1]; // Get the part after prefix
        if (payloadStr) {
           const lastDashIndex = payloadStr.lastIndexOf('-');
           const userId = payloadStr.substring(0, lastDashIndex);
           await this.userRepo.updateByUserId(userId, { isPremium: true } as any);
           try {
              const user = await this.userRepo.findByUserId(userId);
              if (user && user.email) {
                 const subject = 'Nâng cấp tài khoản VIP thành công';
                 const html = `<p>Chào ${user.fullname},</p><p>Tài khoản của bạn đã được nâng cấp lên VIP thành công. Bạn hiện có thể đăng bài không giới hạn.</p>`;
                 await this.mailService.sendMail(user.email, subject, html, MailType.UPGRADE_VIP);
              }
           } catch(e) {
              console.error('Send VIP email failed', e);
           }
        }
      }
      return { success: true };
    }

    const order = await this.repo.findByInvoice(invoice);
    if (!order) throw new BadRequestException('Order not found');

    if (order.status === 'paid') return { success: true };

    if (Number(order.total) !== amount) {
      throw new BadRequestException('Amount mismatch');
    }

    if (type === 'ORDER_PAID') {
      await this.repo.markPaid(invoice, body?.transaction?.transaction_id, body);
  //      try {
  //   const orderAfter = await this.repo.findByInvoice(invoice);
  //   const to = orderAfter?.shipping?.email;
  //   if (to) {
  //     const subject = `Xác nhận đơn hàng ${invoice}`;
  //     const html = orderPaidEmailHtml(orderAfter);

  //     await this.mailService.sendMail(to, subject, html, MailType.ORDER_PAID);
  //     await this.repo.markEmailSent(invoice);
  //   }
  // } catch (e) {
  //   console.error('Send paid email failed:', e);
  // }
    }

    return { success: true };
  }

  async getOrderByInvoice(
    invoice: string,
  ): Promise<BaseResponseDto<OrderResponseDto>> {
    if (!invoice) throw new BadRequestException('Missing invoice');

    const order = await this.repo.findByInvoice(invoice);
    if (!order) throw new BadRequestException('Order not found');

    const data: OrderResponseDto = {
      id: String(order._id),
      user_id: order.user_id,
      status: order.status as any,
      total: order.total,
      shipping: order.shipping,
      items: order.items,
      sepay: {
        orderInvoiceNumber: order.sepay.orderInvoiceNumber,
        status: order.sepay.status,
        transactionId: order.sepay.transactionId,
        paidAt: order.sepay.paidAt ? order.sepay.paidAt.toISOString() : undefined,
      },
      createdAt: order.createdAt ? order.createdAt.toISOString() : new Date().toISOString(),
      updatedAt: order.updatedAt ? order.updatedAt.toISOString() : (order.createdAt ? order.createdAt.toISOString() : new Date().toISOString()),
    };

    return { success: true, data };
  }
}