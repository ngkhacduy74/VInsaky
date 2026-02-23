import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, Req } from '@nestjs/common';
import { OrderAbstract } from 'src/abstracts/order.abstract';
import { CreateOrderDto } from 'src/dtos/request/order/create-order.dto';


@Controller('orders')
export class OrdersController {
  constructor(private readonly orderService: OrderAbstract) {}

  @Post('checkout')
  @HttpCode(HttpStatus.OK)
  checkout(@Body() dto: CreateOrderDto, @Req() req: any) {
    return this.orderService.checkoutSepay(req.user?.id, dto);
  }

  @Post('ipn/sepay')
  @HttpCode(HttpStatus.OK)
  async ipn(@Req() req: any, @Body() body: any) {
    await this.orderService.handleSepayIpn(req.headers, body);
    return { success: true };
  }

  @Get('invoice/:invoice')
  async getByInvoice(@Param('invoice') invoice: string) {
    return this.orderService.getOrderByInvoice(invoice);
  }
}