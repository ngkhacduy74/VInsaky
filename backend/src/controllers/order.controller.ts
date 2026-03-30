import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Req,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { OrderAbstract } from 'src/abstracts/services/order.abstract';
import { CreateOrderDto } from 'src/dtos/request/order/create-order.dto';
@ApiTags('orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly orderService: OrderAbstract) {}

  // tạo order và trả về link thanh toán sepay
  @Post('checkout')
  @HttpCode(HttpStatus.OK)
  checkout(@Body() dto: CreateOrderDto, @Req() req: any) {
    return this.orderService.checkoutSepay(req.user?.id, dto);
  }
  // nhận callback từ sepay khi có giao dịch mới hoặc cập nhật trạng thái giao dịch
  @Post('ipn/sepay')
  @HttpCode(HttpStatus.OK)
  async ipn(@Req() req: any, @Body() body: any) {
    await this.orderService.handleSepayIpn(req.headers, body);
    return { success: true };
  }
  // lấy thông tin order theo invoice
  @Get('invoice/:invoice')
  async getByInvoice(@Param('invoice') invoice: string) {
    return this.orderService.getOrderByInvoice(invoice);
  }
}
