import { Body, Controller, Get, HttpCode, Param, Post, Req } from '@nestjs/common';
import { OrderAbstract } from 'src/abstracts/order.abstract';


@Controller('orders')
export class OrdersController {
  constructor(private readonly orderService: OrderAbstract) {}

  @Post('checkout')
  @HttpCode(200)
  checkout(@Body() dto: any, @Req() req: any) {
    return this.orderService.checkoutSepay(req.user?.id, dto);
  }

  @Post('ipn/sepay')
  @HttpCode(200)
  async ipn(@Req() req: any, @Body() body: any) {
    await this.orderService.handleSepayIpn(req.headers, body);
    return { success: true };
  }

  @Get('invoice/:invoice')
  async getByInvoice(@Param('invoice') invoice: string) {
    return this.orderService.getOrderByInvoice(invoice);
  }
}