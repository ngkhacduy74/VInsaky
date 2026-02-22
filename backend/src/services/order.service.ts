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

@Injectable()
export class OrderService implements OrderAbstract {
  constructor(
    private readonly repo: OrderRepository,
    private readonly config: ConfigService,
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
    userId: string | undefined,
    payload: CreateOrderDto,
  ): Promise<BaseResponseDto<SepayCheckoutResponseDto>> {
    const total = Number(payload?.total);
    if (!Number.isFinite(total) || total <= 0) {
      throw new BadRequestException('Invalid total');
    }
    if (!payload?.shipping?.fullName || !payload?.shipping?.phone || !payload?.shipping?.addressDetail) {
      throw new BadRequestException('Missing shipping info');
    }
    if (!payload?.items || payload.items.length === 0) {
      throw new BadRequestException('Items is empty');
    }

        
    const merchant = this.getEnvOrThrow('SEPAY_MERCHANT');
    const secretKey = this.getEnvOrThrow('SEPAY_SECRET_KEY');
    const baseUrl = this.getEnvOrThrow('SEPAY_BASE_URL');
    const successUrl = this.getEnvOrThrow('SEPAY_SUCCESS_URL');
    const errorUrl = this.getEnvOrThrow('SEPAY_ERROR_URL');
    const cancelUrl = this.getEnvOrThrow('SEPAY_CANCEL_URL');

    const invoice = this.createInvoice();
    await this.repo.createOrder(userId, payload, invoice);

    const fields: Record<string, any> = {
      merchant,
      currency: 'VND',
      order_amount: total,
      operation: 'PURCHASE',
      order_description: `Thanh toan don hang ${invoice}`,
      order_invoice_number: invoice,
      payment_method: 'BANK_TRANSFER',
      customer_id: userId ?? 'GUEST',
      success_url: successUrl,
      error_url: errorUrl,
      cancel_url: cancelUrl,
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
    // 1) Verify header X-Secret-Key
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

    const order = await this.repo.findByInvoice(invoice);
    if (!order) throw new BadRequestException('Order not found');

    if (order.status === 'paid') return { success: true };

    if (Number(order.total) !== amount) {
      throw new BadRequestException('Amount mismatch');
    }

    if (type === 'ORDER_PAID') {
      await this.repo.markPaid(invoice, body?.transaction?.transaction_id, body);
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